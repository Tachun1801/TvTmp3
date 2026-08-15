package com.tvtmp3.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tvtmp3.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm user theo email — dùng khi đăng nhập.
     * Derived query: Spring đọc tên method và tự sinh SQL WHERE email = ?
     */
    Optional<User> findByEmail(String email);

    /**
     * Kiểm tra email đã tồn tại chưa — dùng khi đăng ký.
     * Tốt hơn findByEmail().isPresent() vì chỉ SELECT COUNT, không kéo cả bản ghi.
     */
    boolean existsByEmail(String email);
}
