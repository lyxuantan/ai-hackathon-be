# BE CLAUDE.md — Spring Boot Backend

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 4.0.6 |
| Build | Maven (wrapper `./mvnw`) |
| Database | MariaDB 10.11+ |
| ORM | Spring Data JPA / Hibernate |
| Auth | Spring Security + JWT (JJWT 0.12.x) |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Migrations | Flyway |
| Boilerplate | Lombok |
| Validation | Jakarta Validation |

---

## Commands

```bash
# Build (skip tests)
cd be && ./mvnw clean package -DskipTests

# Run dev server (profile=local)
cd be && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Run tests
cd be && ./mvnw test

# Check migration status
cd be && ./mvnw flyway:info
```

---

## Project Structure

```
src/main/java/com/ai_hackathon/app/
├── config/          # SecurityConfig, OpenApiConfig
├── controller/      # REST controllers
├── dto/
│   ├── request/     # *Request DTOs
│   └── response/    # *Response DTOs + ApiResponse<T> + PageResponse<T>
├── entity/          # JPA entities
├── exception/       # AppException, ErrorCode, GlobalExceptionHandler
├── repository/      # Spring Data JPA repositories
├── security/        # JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
└── service/
    ├── *Service.java         # interfaces
    └── impl/*ServiceImpl.java
```

```
src/main/resources/
├── application.yaml              # Main config
├── application-local.yaml        # Local overrides (gitignored)
└── db/migration/
    ├── V1__init_users.sql
    ├── V2__create_projects.sql
    ├── V3__create_tasks.sql
    ├── V4__create_tags.sql
    ├── V5__create_spec_files.sql
    ├── V6__create_chat_messages.sql
    ├── V7__create_system_parameters.sql
    └── V8__create_command_parameter_mappings.sql
```

---

## Code Conventions

### Lombok — chỉ dùng các annotation sau, KHÔNG dùng `@Data`

```java
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyDto { ... }
```

### ApiResponse wrapper — LUÔN wrap response

```java
// Success
return ResponseEntity.ok(ApiResponse.success(data));
// Created
return ResponseEntity.status(201).body(ApiResponse.created(data));
```

### Exception pattern

```java
// Throw trong service:
throw new AppException(ErrorCode.NOT_FOUND);

// GlobalExceptionHandler tự xử lý → trả về { status, message, data: null }
```

### Service pattern

```java
@Service
@Transactional(readOnly = true)   // class-level default
@RequiredArgsConstructor
public class MyServiceImpl implements MyService {

    @Transactional  // override cho write methods
    public MyResponse create(MyRequest request) { ... }

    private MyEntity findOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
    }
}
```

### Controller pattern

```java
@RestController
@RequestMapping("/api/v1/my-resource")
@RequiredArgsConstructor
@Tag(name = "MyResource", description = "...")
public class MyController {

    private final MyService myService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MyResponse>>> list(...) { ... }

    @PostMapping
    public ResponseEntity<ApiResponse<MyResponse>> create(@Valid @RequestBody MyRequest req) { ... }
}
```

### Repository với JPQL search

```java
@Query("SELECT e FROM MyEntity e WHERE " +
       "(:keyword IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
Page<MyEntity> search(@Param("keyword") String keyword, Pageable pageable);
```

---

## Database Rules

- Tên bảng: `snake_case`, số nhiều (e.g., `system_parameters`)
- Tên cột: `snake_case`
- Migration: `V{n}__{snake_case_description}.sql`
- **KHÔNG bao giờ sửa migration đã applied** — tạo migration mới nếu cần thay đổi
- Migration tiếp theo: `V9__...`

---

## API Conventions

- Base path: `/api/v1/`
- CRUD chuẩn:
  - `GET /api/v1/{resource}?keyword=&page=0&size=10&sort=field,asc` — danh sách
  - `GET /api/v1/{resource}/{id}` — chi tiết
  - `POST /api/v1/{resource}` — tạo mới → 201
  - `PUT /api/v1/{resource}/{id}` — cập nhật → 200
  - `DELETE /api/v1/{resource}/{id}` → 200
- Swagger: `http://localhost:8080/swagger-ui.html`

---

## ErrorCode Enum (hiện có)

| Code | HTTP | Message |
|------|------|---------|
| UNAUTHORIZED | 401 | Unauthorized |
| USER_NOT_FOUND | 404 | User not found |
| NOT_FOUND | 404 | Resource not found |
| KEY_EXISTS | 409 | Key already exists |
| IN_USE | 409 | Resource is in use |

Thêm ErrorCode mới trong `exception/ErrorCode.java`.

---

## Security Rules

- Mọi endpoint đều yêu cầu JWT (Bearer token)
- Public endpoints: `/api/v1/auth/**`, `/api/v1/health`, `/swagger-ui/**`, `/v3/api-docs/**`
- Khi thêm endpoint mới: KHÔNG sửa SecurityConfig trừ khi cần public route

---

## JPA & Performance Rules

### FetchType — luôn dùng LAZY cho collections

```java
// ✅ — đã đúng trong Project.java
@OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
private List<Task> tasks = new ArrayList<>();

// ❌ — KHÔNG bao giờ dùng EAGER cho collection
@OneToMany(fetch = FetchType.EAGER)
```

### Không dùng `findAll()` không có Pageable

```java
// ❌ — trả về toàn bộ table, OOM khi data lớn
repository.findAll()

// ✅
repository.findAll(pageable)
// hoặc JPQL với keyword + Pageable
```

### Tránh N+1 query — dùng JOIN FETCH khi cần load quan hệ

```java
// ❌ — mỗi project sẽ gây thêm query load tasks
List<Project> projects = projectRepo.findAll();
projects.forEach(p -> p.getTasks().size()); // N+1

// ✅ — một query duy nhất
@Query("SELECT p FROM Project p LEFT JOIN FETCH p.tasks WHERE p.id = :id")
Optional<Project> findWithTasks(@Param("id") Long id);
```

### `@Column` phải khai báo rõ ràng cho String fields

```java
// ❌ — unlimited TEXT, không validate ở DB layer
@Column(nullable = false)
private String name;

// ✅
@Column(nullable = false, length = 255)
private String name;

@Column(columnDefinition = "TEXT")  // chỉ khi thực sự cần TEXT dài
private String description;
```

### Timestamps — dùng `@PrePersist / @PreUpdate` (đã có pattern trong User.java)

Luôn có `createdAt` (updatable = false) và `updatedAt` trên mọi entity.

---

## Logging Rules

```java
// ✅ — dùng @Slf4j (Lombok), không System.out.println
@Slf4j
@Service
public class AuthServiceImpl {
    public void login(...) {
        log.info("Login attempt: email={}", email);   // ✅ log email OK
        log.debug("User found: id={}", user.getId()); // ✅ log ID OK
        log.error("Auth failed for email={}", email, ex);
    }
}
```

**KHÔNG bao giờ log:**
- `password`, `token`, `secret`, header `Authorization`
- Full request body khi có trường mật khẩu
- Stack trace trực tiếp ra HTTP response (đã xử lý trong `GlobalExceptionHandler`)

```java
// ❌ — leak password vào log
log.debug("Login request: {}", request); // request có trường password

// ✅ — log fields an toàn
log.debug("Login attempt: email={}", request.getEmail());
```

---

## Security Rules

### JWT

- Chỉ put `email` (username) vào JWT subject — KHÔNG put password, role, permission trong payload
- `app.jwt.secret` phải ≥ 32 ký tự (256-bit cho HMAC-SHA256) — validate khi khởi động
- Expiration production: ≤ 24h (`app.jwt.expiration-ms=86400000`)
- Khi token hết hạn → FE phải redirect về `/login`, clear token khỏi storage

### Input Validation — bắt buộc trên mọi DTO

```java
// ✅ — @Valid trên mọi @RequestBody
@PostMapping
public ResponseEntity<?> create(@Valid @RequestBody MyRequest req) { ... }

// DTO phải có đầy đủ constraints
public class MyRequest {
    @NotBlank                          // không cho phép null/empty/whitespace
    @Size(max = 255)                   // chặn payload bombing
    private String name;

    @NotBlank
    @Size(max = 2000)
    private String description;
}
```

### SQL Injection — chỉ dùng parameterized query

```java
// ✅ — JPQL parameterized (JPA enforce tự động)
@Query("SELECT e FROM Entity e WHERE e.name = :name")
List<Entity> findByName(@Param("name") String name);

// ❌ — TUYỆT ĐỐI KHÔNG concat string vào native query
@Query(value = "SELECT * FROM entities WHERE name = '" + name + "'", nativeQuery = true)

// ✅ — native query phải dùng :param binding
@Query(value = "SELECT * FROM entities WHERE name = :name", nativeQuery = true)
List<Entity> findNative(@Param("name") String name);
```

### CORS

- `allowedOrigins` phải đọc từ `application.yaml` — KHÔNG hardcode trong code
- Production: chỉ whitelist domain thực tế (`https://app.tendoo.ai`), không dùng `*`
- `allowCredentials(true)` chỉ khi cần cookie — JWT Bearer không cần, cân nhắc đặt thành `false`

```yaml
# application.yaml
app:
  cors:
    allowed-origins: ${ALLOWED_ORIGINS:http://localhost:5173}
```

### IDOR — Validate ownership ở Service layer

Khi user chỉ được thao tác resource của chính mình:

```java
// ✅ — check ownership trước khi trả về / update / delete
public TaskResponse getById(Long id, Long currentUserId) {
    Task task = findOrThrow(id);
    if (!task.getProject().getUser().getId().equals(currentUserId)) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }
    return mapper.toResponse(task);
}
```

### Response — không bao giờ lộ password hoặc sensitive field

```java
// ❌ — User entity có trường password
return ApiResponse.success(user);

// ✅ — DTO chỉ expose safe fields
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private LocalDateTime createdAt;
    // KHÔNG có: password, token, internalFlags
}
```

### Sensitive files — phải trong .gitignore

```
application-local.yaml
.env
.env.*
*.secret
*.pem
*.key
```

---

## Never Do

- Commit `application-local.yaml` hoặc file có credentials
- Dùng `spring.jpa.hibernate.ddl-auto=create/drop` trong non-local profiles
- Return raw Entity từ Controller
- Return null từ Service — dùng `findOrThrow()` hoặc `Optional.orElseThrow()`
- Sửa Flyway migration đã applied
- Dùng `@Query` với string concatenation trong native SQL
- Log `password`, `token`, `Authorization` header
- Bỏ `@Valid` trên `@RequestBody`
- Dùng `findAll()` không có `Pageable` trên bảng lớn
- Return `User.password` trong bất kỳ DTO nào
- Throw `RuntimeException` trực tiếp — luôn dùng `AppException(ErrorCode.X)`

---

## Before Finishing Task

```bash
cd be && ./mvnw clean package -DskipTests
```

Build pass → đánh dấu `[x]` trong `be/tasks/todo.md`.
