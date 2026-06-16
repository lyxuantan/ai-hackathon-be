# Hướng dẫn cài đặt môi trường Local

## Yêu cầu

| Tool | Version | Kiểm tra |
|------|---------|---------|
| Java | 21 | `java -version` |
| Maven | wrapper có sẵn | `./mvnw -v` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Docker Desktop | mới nhất | `docker -v` |
| Git | mới nhất | `git -v` |

---

## Bước 1 — Clone repo

```bash
git clone <repo-url>
cd ai-hackathon-be
```

---

## Bước 2 — Khởi động Database (MariaDB via Docker)

```bash
cd be
docker compose up -d
```

Kiểm tra DB đã sẵn sàng:
```bash
docker compose ps
# STATUS phải là "healthy"
```

Thông tin kết nối local:
- Host: `localhost:3306`
- Database: `ai_hackathon`
- Username: `root`
- Password: `root1234`

---

## Bước 3 — Cấu hình BE

Tạo file `be/src/main/resources/application-local.yaml` (file này gitignored):

```yaml
spring:
  datasource:
    url: jdbc:mariadb://localhost:3306/ai_hackathon
    username: root
    password: root1234

app:
  jwt:
    secret: local-dev-secret-key-must-be-at-least-32-chars
    expiration-ms: 86400000   # 24h
  cors:
    allowed-origins: http://localhost:5173
```

---

## Bước 4 — Chạy Backend

```bash
# Windows
cd be && .\run.bat

# Hoặc trực tiếp
cd be && .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

Verify:
- API: `http://localhost:8080/api/v1/health` → `{ status: 200, data: "healthy" }`
- Swagger: `http://localhost:8080/swagger-ui.html`
- Flyway migrations chạy tự động khi khởi động

---

## Bước 5 — Cấu hình FE

```bash
cd fe
```

Tạo file `fe/.env.local` (gitignored):
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## Bước 6 — Chạy Frontend

```bash
cd fe
npm install
npm run dev
```

Truy cập: `http://localhost:5173`

---

## Verify toàn bộ stack

- [ ] `http://localhost:8080/api/v1/health` → 200
- [ ] `http://localhost:8080/swagger-ui.html` → Swagger UI hiển thị
- [ ] `http://localhost:5173` → Login page hiển thị
- [ ] Login thành công → vào được trang System Parameters

---

## Troubleshooting

**BE không start — "Access denied for user root"**
→ DB chưa healthy. Chạy `docker compose ps` và chờ `STATUS = healthy`.

**FE build lỗi TypeScript**
→ `cd fe && npm run build` để xem chi tiết. Sửa lỗi trước khi chạy dev.

**Port 8080 đang bận**
→ `lsof -i :8080` (Mac/Linux) hoặc `netstat -ano | findstr 8080` (Windows) để kill process.

**Flyway checksum error**
→ Migration đã applied bị sửa. KHÔNG sửa file migration đã chạy — tạo migration mới.
