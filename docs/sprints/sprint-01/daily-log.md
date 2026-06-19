# Daily Log — Sprint 01

> Output của `/ship/standup` mỗi ngày được append vào đây.
> Format: `---` separator giữa các ngày.

---

## 2026-06-09 (Ngày 1)

**✅ DONE**
- Setup base project: Spring Boot 4 + MariaDB + Flyway + JWT
- V1-V6 migrations (users, projects, tasks, tags, spec_files, chat_messages)
- Auth endpoints: POST /api/v1/auth/login + /register

**🎯 TODAY**
- Bắt đầu System Parameters feature
- Flyway V7 + V8
- Entity + Repository

**🚧 BLOCKER**
- Không có

---

## 2026-06-10 (Ngày 2)

**✅ DONE**
- Flyway V7 (system_parameters) + V8 (command_parameter_mappings stub)
- SystemParameter entity, ErrorCode additions
- SystemParameterRepository với JPQL search + in-use check

**🎯 TODAY**
- SystemParameterServiceImpl + Controller
- Unit tests

**🚧 BLOCKER**
- Không có

---

## 2026-06-11 (Ngày 3)

**✅ DONE**
- SystemParameterServiceImpl (full CRUD business logic)
- SystemParameterController (6 endpoints + Swagger)
- 54 unit tests pass

**🎯 TODAY**
- output/API.md + DB-DESIGN.md
- Bắt đầu FE

**🚧 BLOCKER**
- Không có

---

## 2026-06-12 (Ngày 4)

**✅ DONE**
- be/output/API.md + DB-DESIGN.md
- FE: Types + API client + useSystemParameters hook
- FE: SystemParametersPage + Table columns

**🎯 TODAY**
- FE: Form modal + Delete dialog
- FE: API integration test

**🚧 BLOCKER**
- Không có

---

## 2026-06-13 (Ngày 5)

**✅ DONE**
- FE: SystemParameterFormModal (create/edit)
- FE: DeleteConfirmDialog
- npm run build pass

**🎯 TODAY**
- Figma alignment
- SonarQube fixes

**🚧 BLOCKER**
- Không có

---

## 2026-06-14 (Ngày 6)

**✅ DONE**
- Figma alignment: columns, labels, modal width, button text
- SonarQube: S6759 (Readonly props), S6479 (key index), S3358 (nested ternary), S7781 (regex /u)
- coverage ≥ 80%, quality gate pass

**🎯 TODAY**
- Sprint review + carry-over xác nhận
- Chuẩn bị Sprint 02

**🚧 BLOCKER**
- Không có

---
<!-- Thêm ngày mới bên dưới bằng cách chạy /ship/standup và append output vào đây -->
