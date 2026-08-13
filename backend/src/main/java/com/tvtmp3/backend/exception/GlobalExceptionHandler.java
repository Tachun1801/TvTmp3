package com.tvtmp3.backend.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * "Lưới bắt lỗi" toàn cục của ứng dụng — nơi DUY NHẤT chuyển exception thành
 * JSON trả về cho client.
 *
 * === LUỒNG CHẠY ===
 *   1. Service ném ResourceNotFoundException (controller KHÔNG try-catch)
 *   2. Spring đưa exception tới method handleNotFound() có @ExceptionHandler
 *      khớp với kiểu exception
 *   3. Method trả ResponseEntity(404) -> Jackson tự serialize ErrorResponse
 *      thành JSON -> gửi về client
 *
 * === VÌ SAO CẦN FILE NÀY ===
 * Nếu không có nó, Spring Boot dùng BasicErrorController trả body lỗi mặc định
 * KHÔNG có field `message` -> frontend (đọc err.response.data.message) không
 * hiển thị được lỗi cụ thể.
 *
 * === QUY TẮC CHỌN HANDLER ===
 * Spring chọn method có kiểu exception KHỚP CỤ THỂ NHẤT.
 * VD: ném ResourceNotFoundException -> vào handleNotFound(), KHÔNG rơi vào
 * handleUnexpected() mặc dù nó cũng extends RuntimeException.
 *
 * === LƯU Ý: LỖI TỪ SPRING SECURITY KHÔNG ĐI QUA ĐÂY ===
 * @RestControllerAdvice chỉ bắt exception phát sinh từ CONTROLLER trở vào trong.
 * Lỗi 401/403 phát sinh trong chuỗi filter của Spring Security được xử lý
 * riêng bởi CustomAuthenticationEntryPoint / CustomAccessDeniedHandler
 * (package security) — 2 nơi đó cũng dùng chung ErrorResponse nên body lỗi
 * toàn app vẫn đồng nhất.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ============================================================
    // 404 — KHÔNG TÌM THẤY DỮ LIỆU
    // ============================================================

    /**
     * Service ném ResourceNotFoundException khi findById() không ra kết quả.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", e.getMessage()));
    }

    /**
     * Client gọi một endpoint KHÔNG TỒN TẠI (sai path).
     * Spring ném NoResourceFoundException ở tầng DispatcherServlet —
     * thêm handler này để cả lỗi "sai đường dẫn" cũng có body giống các lỗi khác.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResource(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", "Endpoint không tồn tại: " + e.getResourcePath()));
    }

    // ============================================================
    // 400 — DỮ LIỆU GỬI LÊN KHÔNG HỢP LỆ
    // ============================================================

    /**
     * Vi phạm quy tắc nghiệp vụ do service kiểm tra và tự ném
     * (email đã tồn tại, favorite trùng lặp...).
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException e) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("BAD_REQUEST", e.getMessage()));
    }

    /**
     * Lỗi từ @Valid trên @RequestBody (VD: RegisterRequest thiếu email).
     * Chỉ lấy lỗi field ĐẦU TIÊN để trả về — đủ cho UI hiển thị 1 thông báo,
     * không cần gửi cả danh sách dài.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleBodyValidation(MethodArgumentNotValidException e) {
        FieldError first = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .orElse(null);

        String message = (first != null)
                ? "Trường '" + first.getField() + "' không hợp lệ: " + first.getDefaultMessage()
                : "Dữ liệu gửi lên không hợp lệ";

        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    /**
     * Lỗi validation trên @RequestParam / @PathVariable
     * (VD: @Min(1) @RequestParam int size mà client gửi size=0).
     * Spring 6.1+ ném HandlerMethodValidationException thay vì
     * ConstraintViolationException cho trường hợp này.
     */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleParamValidation(HandlerMethodValidationException e) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDATION_ERROR", "Tham số truyền lên không hợp lệ"));
    }

    /**
     * Validation ở tầng service/repository (VD: @Validated trên service,
     * hoặc JPA tự validate trước khi lưu DB).
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .findFirst()
                .map(ConstraintViolation::getMessage)
                .orElse("Dữ liệu gửi lên không hợp lệ");

        return ResponseEntity.badRequest()
                .body(new ErrorResponse("VALIDATION_ERROR", message));
    }

    /**
     * Body JSON gửi lên sai cú pháp / thiếu field kiểu enum...
     * (VD: client gửi {"email": thiếu ngoặc kép} -> không parse được).
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("BAD_REQUEST", "Body JSON không hợp lệ hoặc sai định dạng"));
    }

    // ============================================================
    // 401 / 403 — XÁC THỰC VÀ PHÂN QUYỀN
    // ============================================================

    /**
     * Chưa đăng nhập / sai mật khẩu / token không hợp lệ.
     * Frontend dựa vào đúng status 401 này để xóa token và logout (client.js).
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("UNAUTHORIZED", e.getMessage()));
    }

    /**
     * Đã đăng nhập nhưng không có quyền (VD: xóa bài hát của người khác).
     *
     * Dùng AccessDeniedException của Spring Security thay cho exception tự
     * viết — service ném nó cho các kiểm tra phân quyền nghiệp vụ:
     *   throw new AccessDeniedException("Bạn không có quyền xóa bài hát này");
     *
     * LƯU Ý 2 ĐƯỜNG XỬ LÝ 403:
     * - Ném từ controller/service -> advice này bắt -> 403 JSON
     * - Phát sinh trong filter chain (@PreAuthorize...) -> CustomAccessDeniedHandler
     *   xử lý, không đi qua đây
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("FORBIDDEN", e.getMessage()));
    }

    // ============================================================
    // 409 — XUNG ĐỘT VỚI RÀNG BUỘC DATABASE
    // ============================================================

    /**
     * Vi phạm ràng buộc do database chặn: email UNIQUE bị trùng, khóa ngoại
     * trỏ tới bản ghi không tồn tại, v.v.
     *
     * Đây là "lưới an toàn" tầng cuối: service NÊN kiểm tra trước và ném
     * BadRequestException với message thân thiện; handler này chỉ bắt những
     * trường hợp service quên kiểm tra (VD: 2 request đăng ký cùng email
     * chạy đồng thời cùng lúc).
     *
     * Trả message chung chung vì message gốc của DB chứa chi tiết kỹ thuật
     * không nên lộ cho client.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataConflict(DataIntegrityViolationException e) {
        log.warn("Vi phạm ràng buộc database: {}", e.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("CONFLICT", "Dữ liệu trùng lặp hoặc vi phạm ràng buộc database"));
    }

    // ============================================================
    // 500 — MỌI LỖI CÒN LẠI (catch-all)
    // ============================================================

    /**
     * Lưới an toàn cuối cùng: bất kỳ exception nào chưa có handler riêng
     * (NullPointerException, SQL lỗi, bug bất ngờ...) đều rơi vào đây.
     *
     * QUAN TRỌNG:
     * - Log ĐẦY ĐỦ stacktrace phía server để dev debug.
     * - Trả client message CHUNG CHUNG — không được lộ chi tiết nội bộ
     *   (tên bảng, câu SQL, đường dẫn file...) vì đó là lỗ hổng bảo mật.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception e) {
        log.error("Lỗi không mong đợi: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("INTERNAL_ERROR", "Đã có lỗi xảy ra trên server, vui lòng thử lại sau"));
    }
}
