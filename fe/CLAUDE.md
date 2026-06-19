# fe/CLAUDE.md — Tendoo AI Frontend

React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui admin portal.

---

## Stack

| Mục | Chi tiết |
|-----|---------|
| Framework | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui (`src/components/ui/`) |
| Routing | TanStack Router (`router.tsx`) |
| Server state | TanStack Query (`useQuery`, `useMutation`) |
| Forms | react-hook-form + zod |
| Icons | lucide-react |
| Tests | Vitest + @testing-library/react + jsdom |
| Coverage | @vitest/coverage-v8 → LCOV → SonarQube |

---

## Cấu trúc thư mục

```
src/
├── components/
│   ├── app/          # AppLayout, AppHeader, Sidebar
│   ├── ui/           # shadcn/ui primitives — KHÔNG tự ý sửa
│   └── <feature>/    # feature-scoped components
├── hooks/            # useDebounce, useSystemParameters, ...
├── lib/
│   ├── api/          # apiFetch wrapper + per-resource functions
│   └── utils.ts      # cn()
├── pages/            # Page-level components
├── types/            # TypeScript interfaces
└── test/             # Mirror của src/ — *.test.ts(x)
    ├── components/
    ├── hooks/
    ├── lib/
    └── pages/
```

---

## TypeScript Rules

### Không dùng `any`
```ts
// ❌
function handle(data: any) { ... }

// ✅
function handle(data: SystemParameter) { ... }
```

### Props phải có explicit interface + Readonly
```tsx
// ❌
function Modal({ open, onClose }) { ... }

// ✅
interface ModalProps {
  open: boolean
  onClose: () => void
}
export function Modal({ open, onClose }: Readonly<ModalProps>) { ... }
```
> Lý do: SonarQube S6759 — function params phải immutable

### Không dùng non-null assertion `!`
```tsx
// ❌ — S4325
return <Link to={item.path!}>

// ✅ — null guard trước
if (!item.path) return null
return <Link to={item.path}>
```

### Regex phải có unicode flag `u`
```ts
// ❌ — S7781
.replaceAll(/[^A-Z0-9_]/g, '')

// ✅
.replaceAll(/[^A-Z0-9_]/gu, '')
```

---

## React Rules

### Key trong list — không dùng index
```tsx
// ❌ — S6479
items.map((item, i) => <Row key={i} />)

// ✅ — dùng id từ data
items.map((item) => <Row key={item.id} />)

// ✅ — nếu không có id, tạo const key array trước
const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3'] as const
SKELETON_KEYS.map((key) => <Skeleton key={key} />)
```

### Không lồng ternary — extract render function
```tsx
// ❌ — S3358 (4 levels nesting)
{isLoading ? <Skeleton /> : isError ? <Error /> : rows.length === 0 ? <Empty /> : <Table />}

// ✅ — extract ra function
const renderBody = () => {
  if (isLoading) return <Skeleton />
  if (isError) return <Error />
  if (rows.length === 0) return <Empty />
  return <Table />
}
// JSX:
{renderBody()}
```

### Không lồng template literal
```ts
// ❌ — S4624
return apiFetch(`${BASE}?${query.toString()}`)

// ✅ — extract trước
const qs = query.toString()
const url = qs ? `${BASE}?${qs}` : BASE
return apiFetch(url)
```

### `for...of` thay vì `.forEach()`
```ts
// ❌ — S7728
listeners.forEach((l) => l(state))

// ✅
for (const l of listeners) { l(state) }
```

### `Number.isFinite` thay vì global `isFinite`
```ts
// ❌ — S7773
if (isFinite(Number(val))) ...

// ✅
if (Number.isFinite(Number(val))) ...
```

---

## Styling Rules

**Không hardcode màu** — chỉ dùng semantic tokens:

| Dùng khi nào | Token |
|-------------|-------|
| Background trang | `bg-background` |
| Card / panel | `bg-card`, `text-card-foreground` |
| Text chính | `text-foreground` |
| Text phụ | `text-muted-foreground` |
| Border | `border-border` |
| Primary button | `bg-primary`, `text-primary-foreground` |
| Destructive | `text-destructive`, `bg-destructive` |
| Sidebar | `bg-sidebar`, `text-sidebar-foreground` |

```tsx
// ❌
<div className="bg-white text-gray-700 border-gray-200">

// ✅
<div className="bg-card text-card-foreground border-border">
```

---

## Table Rules (shadcn/ui)

`TableHead` mặc định đã có `scope="col"` — KHÔNG thêm thủ công, không override:

```tsx
// ✅ — src/components/ui/table.tsx đã handle
<TableHead>Tên cấu hình</TableHead>
```

---

## API Layer

### Pattern chuẩn
```ts
// src/lib/api/system-parameters.ts
const BASE = '/api/v1/system-parameters'

export async function listSystemParameters(params: ListParams) {
  const query = new URLSearchParams()
  if (params.keyword) query.set('keyword', params.keyword)
  query.set('page', String(params.page ?? 0))
  const qs = query.toString()
  const url = qs ? `${BASE}?${qs}` : BASE   // không lồng template literal
  return apiFetch<PageResponse<SystemParameter>>(url)
}
```

### Error handling trong mutation
```ts
try {
  await mutation.mutateAsync(data)
  toast({ title: 'Thành công', description: '...' })
  onSuccess()
} catch (err) {
  if (err instanceof ApiError && err.status === 409) {
    toast({ title: 'Lỗi', description: err.message, variant: 'destructive' })
  } else if (err instanceof ApiError) {
    toast({ title: 'Lỗi', description: err.message, variant: 'destructive' })
  } else {
    toast({ title: 'Lỗi', description: 'Đã có lỗi xảy ra', variant: 'destructive' })
  }
}
```

---

## Testing Rules

### Vị trí file test
```
src/test/[mirror-path]/[filename].test.ts(x)

# Ví dụ:
src/components/system-parameters/DeleteConfirmDialog.tsx
→ src/test/components/DeleteConfirmDialog.test.tsx
```

### Setup chuẩn cho component test
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock API modules (không mock hooks trực tiếp)
vi.mock('@/lib/api/system-parameters', () => ({
  deleteSystemParameter: vi.fn(),
}))

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock router nếu component dùng navigate
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: vi.fn() }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    createElement('a', { href: to }, children),
}))

// QueryClient wrapper — retry: false để test nhanh
function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => { vi.clearAllMocks() })
```

### Phải test đủ các path này
```
✅ Happy path: render đúng, call API đúng
✅ Error path: ApiError 409, ApiError non-409, generic Error
✅ Callback props: onClose, onSuccess được gọi đúng lúc
✅ Null/empty data: param=null, list=[]
✅ Loading state: skeleton hiện đúng
✅ Validation: form không submit khi invalid
```

### Coverage config (vite.config.ts)
```ts
coverage: {
  provider: 'v8',
  reporter: ['lcov', 'text'],
  reportsDirectory: './coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/test/**',
    'src/components/ui/**',   // shadcn/ui primitives — không test
    'src/main.tsx',
    'src/router.tsx',
    'src/types/**',
  ],
}
```

---

## SonarQube

### Scan command (với coverage)
```bash
# Bước 1 — generate LCOV
npm run test:coverage

# Bước 2 — scan
npx sonar-scanner \
  "-Dsonar.host.url=https://scan.gem-corp.tech" \
  "-Dsonar.token=<TOKEN>" \
  "-Dsonar.projectKey=Tendoo-Web-ReactJS" \
  "-Dsonar.sources=src" \
  "-Dsonar.exclusions=node_modules/**,dist/**,src/test/**" \
  "-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info" \
  "-Dsonar.coverage.exclusions=src/components/ui/**,src/main.tsx,src/router.tsx,src/types/**"
```

### Quality Gate thresholds
- `new_coverage` ≥ 80% ← quan trọng nhất
- `new_violations` = 0
- `new_duplicated_lines_density` ≤ 3%

### Rules hay vi phạm

| Rule | Vấn đề | Fix |
|------|---------|-----|
| S6759 | Props không Readonly | `Readonly<Props>` |
| S6479 | key = array index | key = item.id hoặc const key array |
| S3358 | Ternary lồng nhau | Extract render function |
| S4624 | Template literal lồng | Extract variable trước |
| S7781 | Regex thiếu `/u` flag | Thêm `u` → `/pattern/gu` |
| S7728 | `.forEach()` | `for...of` |
| S7773 | `isFinite()` global | `Number.isFinite()` |
| S4325 | Non-null `!` | Null guard: `if (!x) return null` |
| S5256 | `<th>` thiếu scope | Default `scope="col"` trong TableHead |
| S1854 | Dead store | Xóa assignment thừa |
| S1481 | Unused variable | Xóa hoặc prefix `_` |

---

## Security Rules

### Token Storage

Token hiện lưu trong `localStorage` (`client.ts:14`). Đây là trade-off phổ biến — cần lưu ý:

```ts
// Hiện tại (localStorage — dễ dùng nhưng XSS-exposed)
localStorage.getItem('accessToken')

// Quy tắc bắt buộc:
// 1. Logout → xóa ngay lập tức
localStorage.removeItem('accessToken')
sessionStorage.clear()

// 2. Không bao giờ đọc/ghi token trong component — chỉ qua lib/api/client.ts
// 3. Không log token ra console
```

### XSS Prevention — KHÔNG dùng `dangerouslySetInnerHTML`

```tsx
// ❌ — XSS ngay lập tức nếu content từ user input
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ — render text thuần, React tự escape
<div>{userContent}</div>

// Nếu BẮT BUỘC render HTML (rich text editor): cài DOMPurify
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### Environment Variables — VITE_ là public

```ts
// ❌ — VITE_ prefix = bundle vào JS, user đọc được trong DevTools
VITE_OPENAI_API_KEY=sk-xxx
VITE_DB_PASSWORD=secret

// ✅ — chỉ put public config vào VITE_
VITE_API_BASE_URL=https://api.tendoo.ai

// Secrets phải để ở BE, call qua API
```

### 401 Handling — redirect về login khi token hết hạn

```ts
// ✅ — trong client.ts, xử lý 401 globally
if (!res.ok) {
  if (res.status === 401) {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'   // hoặc navigate('/login')
    return
  }
  throw new ApiError(res.status, json.message ?? res.statusText)
}
```

### URL Params — không put sensitive data

```ts
// ❌ — email/userId xuất hiện trong server log, browser history
navigate({ to: '/profile', search: { email: user.email } })

// ✅ — dùng path param cho ID, không put PII vào query string
navigate({ to: '/profile/$id', params: { id: user.id } })
```

### File Upload (nếu implement)

```ts
// Validate trước khi gửi lên server
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_SIZE_MB = 10

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Định dạng không hỗ trợ'
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File phải < ${MAX_SIZE_MB}MB`
  return null
}
```

---

## TanStack Query Rules

### Query Keys — extract thành constant

```ts
// ✅ — tập trung query keys, dễ invalidate
export const SYSTEM_PARAM_KEYS = {
  all: ['system-parameters'] as const,
  list: (params: ListParams) => ['system-parameters', 'list', params] as const,
  detail: (id: number) => ['system-parameters', 'detail', id] as const,
}

// Dùng trong hook
useQuery({ queryKey: SYSTEM_PARAM_KEYS.list(params), queryFn: ... })

// Invalidate sau mutation — không refetch tay
queryClient.invalidateQueries({ queryKey: SYSTEM_PARAM_KEYS.all })
```

### staleTime — tránh refetch không cần thiết

```ts
// ✅ — data ít thay đổi (system params, config) → staleTime dài
useQuery({
  queryKey: SYSTEM_PARAM_KEYS.list(params),
  queryFn: () => listSystemParameters(params),
  staleTime: 1000 * 60 * 5,  // 5 phút
})
```

### Conditional query — dùng `enabled`

```ts
// ✅ — chỉ fetch khi có id
useQuery({
  queryKey: SYSTEM_PARAM_KEYS.detail(id),
  queryFn: () => getSystemParameter(id),
  enabled: !!id,   // không fetch khi id = null/undefined
})
```

### Server state — KHÔNG duplicate vào useState

```ts
// ❌ — data bị stale ngay khi mutation xảy ra ở tab khác
const [params, setParams] = useState<SystemParameter[]>([])
useEffect(() => { fetchAll().then(setParams) }, [])

// ✅ — TanStack Query là single source of truth
const { data: params } = useQuery({ queryKey: ..., queryFn: ... })
```

---

## Performance Rules

### KHÔNG tạo object/array inline trong JSX props

```tsx
// ❌ — object mới mỗi render, phá vỡ React.memo
<DataTable columns={['id', 'name', 'value']} style={{ gap: 8 }} />

// ✅ — extract ra ngoài component hoặc useMemo
const COLUMNS = ['id', 'name', 'value'] as const
const tableStyle = { gap: 8 }
<DataTable columns={COLUMNS} style={tableStyle} />
```

### `useCallback` cho handler truyền xuống child

```tsx
// ✅ — tránh re-render child không cần thiết
const handleDelete = useCallback((id: number) => {
  deleteMutation.mutate(id)
}, [deleteMutation])

<DeleteButton onDelete={handleDelete} />
```

### Không dùng `useEffect` cho data fetching

```ts
// ❌ — anti-pattern: manual fetch + state
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData)
}, [])

// ✅ — TanStack Query lo hết
const { data } = useQuery({ queryKey: [...], queryFn: fetchData })
```

---

## Accessibility (a11y)

### Icon-only button — bắt buộc có `aria-label`

```tsx
// ❌ — screen reader đọc là "button"
<Button variant="ghost" size="icon" onClick={handleDelete}>
  <Trash2 className="h-4 w-4" />
</Button>

// ✅
<Button variant="ghost" size="icon" aria-label="Xóa tham số" onClick={handleDelete}>
  <Trash2 className="h-4 w-4" />
</Button>
```

### Form input — phải liên kết với label

```tsx
// ✅
<Label htmlFor="param-key">Tên tham số</Label>
<Input id="param-key" {...register('key')} />

// Nếu không có label hiển thị:
<Input aria-label="Tìm kiếm tham số" {...register('search')} />
```

---

## Verify trước khi done

```bash
cd fe && npm run build        # 0 TypeScript errors
npm run test:coverage         # coverage ≥ 80%
```

Checklist:
- [ ] Build pass, 0 TS errors
- [ ] `Readonly<Props>` trên tất cả component params
- [ ] Không có array index làm key
- [ ] Không có nested ternary > 2 levels
- [ ] Regex có `/gu` flag
- [ ] `Number.isFinite` thay vì `isFinite`
- [ ] `for...of` thay vì `.forEach()`
- [ ] Coverage ≥ 80% trên files mới
- [ ] Test cover đủ: happy + error + callback paths
