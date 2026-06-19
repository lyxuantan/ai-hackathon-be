# Environments

> ⚠️ File này KHÔNG chứa production credentials.
> Staging/Prod passwords phải lấy từ secret manager hoặc hỏi team lead.

---

## Local (Development)

| Thành phần | URL / Giá trị |
|-----------|--------------|
| FE | http://localhost:5173 |
| BE API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |
| MariaDB | localhost:3306 / db: ai_hackathon |
| DB user | root / root1234 (Docker only) |
| JWT secret | local-dev-secret-key-must-be-at-least-32-chars |
| JWT expiry | 24h |

Cách chạy: xem [`docs/setup/environment.md`](../setup/environment.md)

---

## Staging

| Thành phần | URL |
|-----------|-----|
| FE | _(chưa có)_ |
| BE API | _(chưa có)_ |
| MariaDB | _(chưa có)_ |

Credentials: lấy từ team lead / secret manager.

---

## Production

| Thành phần | URL |
|-----------|-----|
| FE | _(chưa có)_ |
| BE API | _(chưa có)_ |
| MariaDB | _(chưa có)_ |

Credentials: **KHÔNG share qua chat/email** — dùng secret manager.

---

## Environment Variables

### Backend (`application-local.yaml` hoặc env vars)

```yaml
spring:
  datasource:
    url: jdbc:mariadb://<host>:3306/ai_hackathon
    username: <DB_USER>
    password: <DB_PASSWORD>

app:
  jwt:
    secret: <JWT_SECRET>        # ≥ 32 chars
    expiration-ms: 86400000     # 24h
  cors:
    allowed-origins: <FE_URL>
```

### Frontend (`.env.local` hoặc CI/CD secrets)

```env
VITE_API_BASE_URL=<BE_URL>
```

---

## Kiểm tra nhanh một environment

```bash
# Health check
curl <BE_URL>/api/v1/health

# Swagger
open <BE_URL>/swagger-ui.html
```
