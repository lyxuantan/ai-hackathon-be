# Git Workflow

## Branch Strategy

```
master          ← Production-ready code. Protected. Chỉ merge qua PR.
│
├── feature/TEN-xxx-<slug>    ← Feature mới
├── fix/TEN-xxx-<slug>        ← Bug fix
├── hotfix/<slug>             ← Critical fix thẳng vào master
└── chore/<slug>              ← Chore: update deps, docs, config
```

**Không làm việc trực tiếp trên `master`.** Mọi thay đổi đều qua PR.

---

## Tạo branch mới

```bash
# Từ master
git checkout master && git pull origin master

# Feature mới
git checkout -b feature/TEN-001-system-parameters

# Bug fix
git checkout -b fix/TEN-042-login-token-expired
```

---

## Naming Convention

| Loại | Format | Ví dụ |
|------|--------|-------|
| Feature | `feature/TEN-xxx-<mô tả>` | `feature/TEN-001-system-parameters` |
| Fix | `fix/TEN-xxx-<mô tả>` | `fix/TEN-042-login-redirect` |
| Hotfix | `hotfix/<mô tả>` | `hotfix/jwt-secret-rotation` |
| Chore | `chore/<mô tả>` | `chore/update-spring-boot-4.0.7` |

Dùng kebab-case, tiếng Anh, ngắn gọn (≤ 5 từ sau prefix).

---

## Commit Convention — Conventional Commits

```
type(scope): subject

body (nếu cần)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Types:** `feat` | `fix` | `refactor` | `test` | `chore` | `docs` | `perf`

**Scopes:** `be` | `fe` | `auth` | `system-params` | `db` | `ci`

**Ví dụ:**
```
feat(be): add system parameters CRUD API

- POST /api/v1/system-parameters → 201
- PUT /api/v1/system-parameters/:id → 200
- Flyway V7 migration included
```

> Dùng `/ship/git-commit` để AI tự sinh commit message chuẩn.

---

## Pull Request Flow

1. Push branch lên remote
2. Tạo PR vào `master` (dùng `/ship/create-pr`)
3. PR description phải có: Summary, Changes, Test Plan
4. Ít nhất 1 reviewer approve
5. CI pass (build BE + build FE)
6. Squash & Merge (giữ history gọn)

---

## Quy tắc bắt buộc

- **KHÔNG force push** lên `master` hoặc branch đang có PR open
- **KHÔNG commit** `application-local.yaml`, `.env.local`, `*.secret`
- **KHÔNG merge** PR khi build fail
- **KHÔNG amend** commit đã push lên remote — tạo commit mới

---

## Lệnh thường dùng

```bash
# Sync với master mới nhất
git fetch origin && git rebase origin/master

# Xem log gọn
git log --oneline -10

# Stash khi cần chuyển branch vội
git stash push -m "wip: mô tả"
git stash pop

# Xem diff với master
git diff origin/master...HEAD
```
