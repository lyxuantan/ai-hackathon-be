# Product Backlog — Tendoo AI

> Cập nhật lần cuối: 2026-06-16
> Sprint hiện tại: Sprint 01

---

## Cách dùng

- `[P1]` Must-have — blocking demo
- `[P2]` Should-have — tăng giá trị
- `[P3]` Nice-to-have — nếu còn thời gian
- `[EST]` Estimate: XS (<2h) / S (2-4h) / M (4-8h) / L (1-2 ngày)

---

## Đã hoàn thành (Done ✅)

| ID | Feature | BE | FE | Sprint |
|----|---------|----|----|--------|
| TEN-001 | System Parameters CRUD | ✅ | ✅ | S01 |

---

## Backlog — Chưa vào sprint

### [P1] Authentication & Authorization

| ID | Task | EST | Ghi chú |
|----|------|-----|---------|
| TEN-010 | Login page UI | S | Đã có BE endpoint |
| TEN-011 | Logout + clear token | XS | Clear localStorage + redirect |
| TEN-012 | 401 auto-redirect về login | XS | Trong `client.ts` |
| TEN-013 | Protect routes (redirect nếu chưa login) | S | TanStack Router beforeLoad |

### [P1] Project Management

| ID | Task | EST | Ghi chú |
|----|------|-----|---------|
| TEN-020 | Project list page | M | BE entity đã có |
| TEN-021 | Tạo / sửa / xóa Project | M | |
| TEN-022 | Project detail page | M | |

### [P1] Task Management

| ID | Task | EST | Ghi chú |
|----|------|-----|---------|
| TEN-030 | Task list trong Project | M | |
| TEN-031 | Tạo / sửa / xóa Task | M | |
| TEN-032 | Thay đổi Task status (Kanban hoặc dropdown) | M | |
| TEN-033 | Assign Tag cho Task | S | |

### [P2] Spec Files

| ID | Task | EST | Ghi chú |
|----|------|-----|---------|
| TEN-040 | Upload / xem Spec File | L | |
| TEN-041 | Thay đổi Spec status (DRAFT/APPROVED) | S | |

### [P2] Chat / AI

| ID | Task | EST | Ghi chú |
|----|------|-----|---------|
| TEN-050 | Chat interface trong Project | L | Tích hợp AI model |
| TEN-051 | Lưu lịch sử chat | M | ChatMessage entity đã có |

### [P2] System Parameters — Nâng cao

| ID | Task | EST | Ghi chú |
|----|------|-----|---------|
| TEN-060 | Thêm field `name` (display name) vào SystemParameter | S | BE V9 migration + FE |
| TEN-061 | Sort by column | S | BE thêm sortBy + direction params |
| TEN-062 | Export CSV | S | FE only |

### [P3] DevEx / Quality

| ID | Task | EST | Ghi chú |
|----|------|-----|---------|
| TEN-070 | E2E tests (Playwright) cho System Parameters | M | |
| TEN-071 | CI/CD pipeline (GitHub Actions) | L | |
| TEN-072 | Staging environment setup | L | |
| TEN-073 | Rate limiting cho `/api/v1/auth/login` | S | Spring Security hoặc Bucket4j |

---

## Ghi chú

- Thêm task mới vào backlog này trước khi vào sprint
- Khi task vào sprint → move sang `sprints/sprint-xx/tasks.md`
- Khi task done → move lên bảng "Đã hoàn thành"
