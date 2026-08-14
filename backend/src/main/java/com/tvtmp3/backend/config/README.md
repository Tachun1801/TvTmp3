# Package `config` — Lắp ráp & cấu hình ứng dụng

## Vai trò

Trong khi `security/` chứa các "bộ phận" rời (filter, service token...), thì
`config/` là **nơi lắp ráp**: khai báo các `@Bean`, nối các bộ phận thành
hệ thống hoàn chỉnh, và cấu hình hành vi của ứng dụng.

## File hiện tại

### `SecurityConfig.java`

3 bean, mỗi bean một nhiệm vụ:

| Bean | Vai trò |
|---|---|
| `SecurityFilterChain` | "Bảng nội quy": endpoint nào công khai, endpoint nào cần đăng nhập; lắp JWT filter vào chuỗi; tắt CSRF/session/form login |
| `PasswordEncoder` | Công cụ mã hóa mật khẩu BCrypt |
| `CorsConfigurationSource` | Cho phép frontend `localhost:5173` gọi API |

⚠️ **Khi thêm endpoint công khai mới → phải thêm vào `SecurityConfig`**, nếu
không mọi request sẽ bị 401 (`anyRequest().authenticated()`).

## Sắp thêm / cách code

### 1. `JwtProperties` — khai báo property `app.jwt.*` chuẩn (khuyên làm)

IDE đang gạch "unknown property" cho `app.jwt.secret` / `app.jwt.expiration-ms`
vì Spring Boot không biết 2 property tự đặt này. Cách chuẩn để IDE nhận biết
(và code type-safe thay cho `@Value`):

**Bước 1 — thêm dependency** (sinh metadata khi compile):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

**Bước 2 — tạo class:**

```java
package com.tvtmp3.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Đọc nhóm property "app.jwt.*" từ application.properties.
 * IDE sẽ nhận biết các property này sau khi compile 1 lần.
 */
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret;         // ← app.jwt.secret
    private long expirationMs;     // ← app.jwt.expiration-ms

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public long getExpirationMs() { return expirationMs; }
    public void setExpirationMs(long expirationMs) { this.expirationMs = expirationMs; }
}
```

**Bước 3 — kích hoạt** (thêm dòng vào `BackendApplication`):

```java
@SpringBootApplication
@ConfigurationPropertiesScan   // ← quét các class @ConfigurationProperties
public class BackendApplication { ... }
```

**Bước 4 — sửa `JwtService`** bỏ 2 tham số `@Value`, inject `JwtProperties`:

```java
public JwtService(JwtProperties properties) {
    this.secret = properties.getSecret();
    this.expirationMs = properties.getExpirationMs();
}
```

### 2. `FileStorageConfig` — cấu hình upload audio/cover (task upload file)

Cần khi làm endpoint upload bài hát:

```java
package com.tvtmp3.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

/**
 * Cho phép truy cập file đã upload qua URL /uploads/...
 * File lưu ở thư mục uploads/ ngoài code.
 */
@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    public static final String UPLOAD_DIR = "uploads";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Path.of(UPLOAD_DIR).toAbsolutePath();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
```

Giới hạn kích thước file upload — thêm vào `application.properties`:

```properties
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=25MB
```

### 3. Tách CORS riêng sang `WebConfig` (tùy chọn)

Hiện CORS nằm trong `SecurityConfig` (bắt buộc vì Spring Security cần bean
này). Nếu project lớn dần, có thể tách phần CORS + file storage sang
`WebConfig` riêng cho gọn — nhưng nhớ `SecurityConfig.cors(...)` vẫn phải
trỏ sang bean đó.
