# System Overview — Tendoo AI

## Mô tả hệ thống

Tendoo AI là admin portal để quản lý prompt, flow, câu lệnh và tham số hệ thống cho AI workflows.

---

## Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│   Browser → React SPA (localhost:5173 / Vercel)             │
│   Vite + TypeScript + Tailwind + shadcn/ui                  │
│   TanStack Router + TanStack Query                          │
└─────────────────┬───────────────────────────────────────────┘
                  │  HTTP/REST (Bearer JWT)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                             │
│   Spring Boot 4.0.6 (localhost:8080)                        │
│   Java 21 — REST API — JWT Auth — Swagger UI                │
│   Spring Security filter chain → Controllers → Services     │
└──────────┬──────────────────────────────────────────────────┘
           │  Spring Data JPA / Hibernate
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│   MariaDB 11.4 (localhost:3306)                             │
│   Database: ai_hackathon                                    │
│   Flyway migrations (V1 → V8)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow

```
Browser
  │
  ├─→ /login → POST /api/v1/auth/login → nhận JWT
  │
  └─→ /system-parameters
        │
        ├─→ GET /api/v1/system-parameters?keyword=&page=0&size=10
        │     JwtAuthFilter → validate token
        │     SystemParameterController
        │     SystemParameterServiceImpl
        │     SystemParameterRepository (JPQL search)
        │     MariaDB → Page<SystemParameter>
        │     → ApiResponse<PageResponse<SystemParameterResponse>>
        │
        ├─→ POST /api/v1/system-parameters  (tạo mới)
        ├─→ PUT  /api/v1/system-parameters/{id}  (cập nhật)
        └─→ DELETE /api/v1/system-parameters/{id}  (xóa)
```

---

## Domain Entities

```
User ──────────────────────────────────────────────────────
  id, email, password (BCrypt), name, createdAt, updatedAt

Project ───────────────────────────────────────────────────
  id, name, description, status (ACTIVE|ARCHIVED)
  └── tasks: List<Task>

Task ──────────────────────────────────────────────────────
  id, title, description, status, priority
  ├── project: Project
  └── tags: List<Tag>

Tag ────────────────────────────────────────────────────────
  id, name, color

SpecFile ──────────────────────────────────────────────────
  id, name, content, status (DRAFT|APPROVED|DEPRECATED)
  └── project: Project

ChatMessage ───────────────────────────────────────────────
  id, content, role (USER|ASSISTANT), timestamp
  └── project: Project

SystemParameter ───────────────────────────────────────────
  id, key (unique), value, description, createdAt, updatedAt
```

---

## Security Model

```
Public (không cần token):
  POST /api/v1/auth/login
  POST /api/v1/auth/register
  GET  /api/v1/health
  GET  /swagger-ui/**
  GET  /v3/api-docs/**

Protected (yêu cầu Bearer JWT):
  Tất cả /api/v1/** còn lại
```

JWT:
- Algorithm: HMAC-SHA256
- Subject: user email
- Expiry: 24h (production)
- Secret: từ `app.jwt.secret` env var

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| FE Framework | React + TypeScript | 18 + 5.x |
| FE Build | Vite | 5.x |
| FE UI | Tailwind CSS + shadcn/ui | 3.x |
| FE Routing | TanStack Router | 1.x |
| FE State | TanStack Query | 5.x |
| FE Forms | react-hook-form + zod | 7.x + 3.x |
| BE Framework | Spring Boot | 4.0.6 |
| BE Language | Java | 21 |
| BE Auth | Spring Security + JJWT | 0.12.x |
| BE ORM | Spring Data JPA / Hibernate | Boot-managed |
| Database | MariaDB | 11.4 |
| DB Migration | Flyway | Boot-managed |
| API Docs | SpringDoc OpenAPI | 2.x |

---

## Flyway Migration History

| Version | File | Mô tả |
|---------|------|-------|
| V1 | `V1__init_users.sql` | Tạo bảng users |
| V2 | `V2__create_projects.sql` | Tạo bảng projects |
| V3 | `V3__create_tasks.sql` | Tạo bảng tasks |
| V4 | `V4__create_tags.sql` | Tạo bảng tags + task_tags |
| V5 | `V5__create_spec_files.sql` | Tạo bảng spec_files |
| V6 | `V6__create_chat_messages.sql` | Tạo bảng chat_messages |
| V7 | `V7__create_system_parameters.sql` | Tạo bảng system_parameters |
| V8 | `V8__create_command_parameter_mappings.sql` | Mapping stub |

Migration tiếp theo: **V9**

---

## Liên kết tài liệu

- API chi tiết: [`be/output/API.md`](../../be/output/API.md)
- DB schema: [`be/output/DB-DESIGN.md`](../../be/output/DB-DESIGN.md)
- BE conventions: [`be/CLAUDE.md`](../../be/CLAUDE.md)
- FE conventions: [`fe/CLAUDE.md`](../../fe/CLAUDE.md)
