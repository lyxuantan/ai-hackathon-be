# Sprint 01 — Tasks

**Thời gian:** 2026-06-09 → 2026-06-15
**Mục tiêu:** System Parameters CRUD hoàn chỉnh (BE + FE) + API integration

---

## Summary

| Metric | Kết quả |
|--------|---------|
| Planned | 12 tasks |
| Completed | 11 tasks ✅ |
| Carry-over | 1 task (TEN-062 sort — optional) |
| Build status | ✅ BE pass / ✅ FE pass |

---

## Task List

| ID | Task | Assignee | EST | Status |
|----|------|----------|-----|--------|
| TEN-001-BE-1 | Flyway V7 (system_parameters) + V8 (mapping stub) | tanlx | XS | ✅ Done |
| TEN-001-BE-2 | SystemParameter entity + ErrorCode | tanlx | XS | ✅ Done |
| TEN-001-BE-3 | SystemParameterRepository + DTOs | tanlx | S | ✅ Done |
| TEN-001-BE-4 | SystemParameterServiceImpl | tanlx | S | ✅ Done |
| TEN-001-BE-5 | SystemParameterController (6 endpoints) + tests | tanlx | M | ✅ Done |
| TEN-001-BE-6 | output/API.md + output/DB-DESIGN.md | tanlx | XS | ✅ Done |
| TEN-001-FE-1 | Types + API functions | tanlx | XS | ✅ Done |
| TEN-001-FE-2 | useSystemParameters hook (TanStack Query) | tanlx | S | ✅ Done |
| TEN-001-FE-3 | SystemParametersPage + Table | tanlx | M | ✅ Done |
| TEN-001-FE-4 | SystemParameterFormModal (create/edit) | tanlx | M | ✅ Done |
| TEN-001-FE-5 | DeleteConfirmDialog | tanlx | S | ✅ Done |
| TEN-001-FE-6 | Figma alignment + Sonar fixes | tanlx | S | ✅ Done |

---

## Carry-over → Sprint 02

| ID | Task | Lý do |
|----|------|-------|
| TEN-062 | Sort by column (BE + FE) | Optional — không blocking demo |

---

## Notes

- BE: 54 unit tests pass
- FE: coverage ≥ 80%, SonarQube quality gate pass
- Gap: `SystemParameter` không có field `name` (display name) — FE dùng `key` làm "Mã cấu hình"
  → Nếu cần: migration V9 + BE update (TEN-060 trong backlog)
