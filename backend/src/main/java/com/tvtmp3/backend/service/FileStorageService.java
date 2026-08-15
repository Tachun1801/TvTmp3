package com.tvtmp3.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tvtmp3.backend.exception.BadRequestException;
import com.tvtmp3.backend.exception.ResourceNotFoundException;

/**
 * Lớp DUY NHẤT trong project đụng tới ổ cứng: lưu file, đọc file, xóa file.
 *
 * Các service khác chỉ gọi class này — không ai tự đọc/ghi `uploads/` trực
 * tiếp. Sau này chuyển sang S3/Cloudinary thì chỉ cần sửa đúng 1 class này.
 *
 * Xem thiết kế tổng thể: backend/docs/upload-stream.md (bước 3)
 */
@Service
public class FileStorageService {

    // Thư mục gốc chứa mọi file upload (tự tạo khi app khởi động)
    private static final Path ROOT = Path.of("uploads").toAbsolutePath().normalize();

    // Danh sách loại file được phép — chặn upload file độc hại lên server
    public static final Set<String> ALLOWED_AUDIO_TYPES = Set.of("audio/mpeg", "audio/mp3");
    public static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    public FileStorageService() {
        try {
            Files.createDirectories(ROOT);
        } catch (IOException e) {
            throw new IllegalStateException("Không tạo được thư mục uploads: " + ROOT, e);
        }
    }

    /**
     * Lưu file vào uploads/&lt;subDir&gt;/&lt;uuid&gt;.&lt;ext&gt;
     *
     * @param file         file từ request multipart
     * @param subDir       thư mục con ("songs", "covers"...)
     * @param allowedTypes tập content-type được chấp nhận
     * @return đường dẫn NỘI BỘ dạng "songs/xxxx.mp3" — giá trị lưu vào DB
     */
    public String store(MultipartFile file, String subDir, Set<String> allowedTypes) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BadRequestException("Loại file không hợp lệ: " + contentType);
        }

        // Lấy đuôi file từ tên gốc (chỉ để dùng lại đuôi — tên file KHÔNG dùng)
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.')).toLowerCase()
                : "";

        // UUID: tên file an toàn — không bao giờ tin tên file của client
        // (chống path traversal: "../../etc/passwd")
        String filename = UUID.randomUUID() + ext;

        try {
            Path target = ROOT.resolve(subDir).resolve(filename);
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new IllegalStateException("Lưu file thất bại", e);
        }
        return subDir + "/" + filename;
    }

    /**
     * Đọc file từ đường dẫn nội bộ (giá trị file_url/img_url trong DB).
     *
     * @throws ResourceNotFoundException nếu file không tồn tại
     */
    public Resource load(String relativePath) {
        Path path = ROOT.resolve(relativePath).normalize();

        // CHỐNG PATH TRAVERSAL: sau khi normalize, path phải VẪN nằm trong ROOT
        // (chuỗi "../" sẽ thoát ra ngoài uploads/ -> từ chối)
        if (!path.startsWith(ROOT)) {
            throw new BadRequestException("Đường dẫn file không hợp lệ");
        }
        Resource resource = new FileSystemResource(path);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("File không tồn tại trên server");
        }
        return resource;
    }

    /**
     * Xóa file vật lý (gọi khi xóa bài hát).
     * File không tồn tại hoặc xóa lỗi -> bỏ qua, không làm hỏng thao tác chính.
     */
    public void delete(String relativePath) {
        if (relativePath == null) {
            return;
        }
        try {
            Path path = ROOT.resolve(relativePath).normalize();
            if (path.startsWith(ROOT)) {
                Files.deleteIfExists(path);
            }
        } catch (IOException e) {
            // xóa file phụ không đáng để làm hỏng cả request
        }
    }
}
