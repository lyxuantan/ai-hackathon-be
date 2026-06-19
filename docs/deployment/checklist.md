# Deployment Checklist

Checklist này áp dụng trước mỗi lần deploy lên Staging hoặc Production.

---

## Pre-Deploy

### Code

- [ ] PR đã được approve (ít nhất 1 reviewer)
- [ ] Branch đã rebase/merge với `master` mới nhất
- [ ] Không có merge conflict
- [ ] Commit message theo Conventional Commits

### Build

- [ ] **BE build pass:** `cd be && ./mvnw clean package -DskipTests`
- [ ] **FE build pass:** `cd fe && npm run build`
- [ ] Không có TypeScript errors (`npm run build` output sạch)

### Tests

- [ ] **BE tests pass:** `cd be && ./mvnw test`
- [ ] **FE tests pass:** `cd fe && npm run test:coverage`
- [ ] Coverage FE ≥ 80%
- [ ] SonarQube quality gate: `new_violations = 0`

### Security

- [ ] Không có credentials trong code (`git diff master -- "*.yaml" "*.env"`)
- [ ] `application-local.yaml` và `.env.local` không trong commit
- [ ] JWT secret production ≥ 32 chars và khác local
- [ ] CORS `allowedOrigins` đúng với production domain

### Database

- [ ] Flyway migrations mới đã review (không có breaking change)
- [ ] Backup DB staging/prod trước khi apply migration mới
- [ ] `./mvnw flyway:info` hiển thị migration pending là đúng

---

## Deploy Steps

### Backend

```bash
# 1. Build JAR
cd be && ./mvnw clean package -DskipTests

# 2. Copy JAR lên server (hoặc CI/CD tự handle)
# target/app-*.jar

# 3. Restart service (tùy environment)
# systemctl restart tendoo-be
# hoặc docker compose up -d --build

# 4. Verify
curl https://<BE_URL>/api/v1/health
```

### Frontend

```bash
# 1. Build với env đúng
cd fe
VITE_API_BASE_URL=https://<BE_URL> npm run build

# 2. Copy dist/ lên server / Vercel / Netlify
# hoặc CI/CD tự handle

# 3. Verify
open https://<FE_URL>
```

---

## Post-Deploy Verification

- [ ] `GET /api/v1/health` → 200 `{ data: "healthy" }`
- [ ] Swagger UI accessible
- [ ] Login hoạt động (POST /api/v1/auth/login → JWT)
- [ ] System Parameters list load đúng
- [ ] Create / Update / Delete System Parameter hoạt động
- [ ] Không có 500 errors trong logs

---

## Rollback Plan

### Backend

```bash
# Rollback về JAR trước (giữ 2 versions)
cp target/app-<previous-version>.jar target/app.jar
systemctl restart tendoo-be

# Nếu có DB migration mới — KHÔNG tự động rollback Flyway
# Cần tạo migration hoàn tác thủ công (V{n+1}__rollback_xxx.sql)
```

### Frontend

```bash
# Redeploy build trước từ CI artifact
# Hoặc git revert commit + redeploy
git revert <commit-hash>
git push origin master
# → trigger CI/CD redeploy
```

### Nguyên tắc

- **Flyway migrations không thể rollback tự động** — thiết kế migration backward-compatible
- Nếu migration có breaking change: deploy BE mới trước, FE sau
- Giữ ít nhất 2 versions JAR trên server để rollback nhanh

---

## CI/CD (Tương lai)

Khi setup CI/CD (GitHub Actions), pipeline sẽ gồm:

```yaml
on: push to master

jobs:
  build-be:
    - mvnw clean package -DskipTests
    - mvnw test
    - Upload JAR artifact

  build-fe:
    - npm run build
    - npm run test:coverage
    - Upload dist artifact

  deploy:
    needs: [build-be, build-fe]
    - Deploy BE lên server
    - Deploy FE lên Vercel/Netlify
    - Run health check
```
