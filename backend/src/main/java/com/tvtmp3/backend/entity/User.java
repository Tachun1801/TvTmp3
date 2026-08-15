package com.tvtmp3.backend.entity;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
public class User {
    
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Getter
    @Setter
    @Column(name = "email")
    private String email;

    @Getter
    @Setter
    @Column(name = "password")
    private String password;

    @Getter
    @Setter
    @Column(name = "full_name")
    private String fullName;

    @Getter
    @Setter
    @Column(name = "birth")
    private LocalDate birth;

    @Getter
    @Column(name = "created_at")
    private Instant createAt;

    /**
     * Tự điền created_at ngay TRƯỚC khi INSERT.
     * Cần thiết vì Hibernate luôn đưa mọi cột vào INSERT — nếu để null thì
     * cột NOT NULL DEFAULT CURRENT_TIMESTAMP sẽ báo lỗi "cannot be null"
     * (DEFAULT chỉ có tác dụng khi cột KHÔNG xuất hiện trong câu INSERT).
     */
    @PrePersist
    void onCreate() {
        this.createAt = Instant.now();
    }
}
