package com.tvtmp3.backend.dto;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Khuôn phân trang CHUNG cho mọi endpoint danh sách.
 *
 * Khớp đúng format frontend mock đang trả: { data, total, page, size }
 * nên khi bật MOCK=false, service/hook phía frontend không phải sửa.
 *
 * === VÌ SAO DÙNG GENERIC ===
 * Một class phục vụ mọi loại danh sách: PageResponse<SongDto>,
 * PageResponse<HistoryDto>... — không cần viết 4 class phân trang khác nhau.
 */
public record PageResponse<T>(
        List<T> data,   // danh sách phần tử của trang hiện tại
        long total,     // tổng số phần tử ở MỌI trang
        int page,       // trang hiện tại (đếm từ 1 — khớp frontend)
        int size        // số phần tử mỗi trang
) {

    /** Chuyển từ Page của Spring Data (đếm từ 0) sang format frontend (đếm từ 1). */
    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(
                p.getContent(),
                p.getTotalElements(),
                p.getNumber() + 1,   // JPA trang 0 = frontend trang 1
                p.getSize()
        );
    }
}
