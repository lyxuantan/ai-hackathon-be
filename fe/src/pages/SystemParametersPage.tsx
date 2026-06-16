import { useState } from 'react'
import { Plus, Pencil, Trash2, SearchX, DatabaseZap, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { SystemParameterFormModal } from '@/components/system-parameters/SystemParameterFormModal'
import { DeleteConfirmDialog } from '@/components/system-parameters/DeleteConfirmDialog'
import { ParamTypeBadge, inferParamType } from '@/components/system-parameters/ParamTypeBadge'
import { useSystemParameterList } from '@/hooks/useSystemParameters'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { SystemParameter } from '@/types/system-parameter'
import type { ParamType } from '@/components/system-parameters/ParamTypeBadge'

const PAGE_SIZES = ['10', '20', '50'] as const
const SKELETON_ROW_KEYS = ['sk-r1', 'sk-r2', 'sk-r3', 'sk-r4', 'sk-r5'] as const
const SKELETON_COL_KEYS = ['sk-c1', 'sk-c2', 'sk-c3', 'sk-c4'] as const
const DATA_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả kiểu dữ liệu' },
  { value: 'Boolean', label: 'Boolean' },
  { value: 'Number', label: 'Number' },
  { value: 'Text', label: 'Text' },
] as const

type DataTypeFilter = 'all' | ParamType

export function SystemParametersPage() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [typeFilter, setTypeFilter] = useState<DataTypeFilter>('all')

  const [createOpen, setCreateOpen] = useState(false)
  const [editParam, setEditParam] = useState<SystemParameter | null>(null)
  const [deleteParam, setDeleteParam] = useState<SystemParameter | null>(null)

  const { data, isLoading, isError } = useSystemParameterList({
    keyword: debouncedKeyword || undefined,
    page,
    size: pageSize,
  })

  const rows = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1

  const filteredRows =
    typeFilter === 'all' ? rows : rows.filter((p) => inferParamType(p.value) === typeFilter)

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
    setPage(0)
  }

  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val))
    setPage(0)
  }

  const handleTypeFilterChange = (val: string) => {
    setTypeFilter(val as DataTypeFilter)
    setPage(0)
  }

  const handleDeleteSuccess = () => {
    setDeleteParam(null)
    if (rows.length === 1 && page > 0) {
      setPage((p) => p - 1)
    }
  }

  const renderTableBody = () => {
    if (isLoading) {
      return SKELETON_ROW_KEYS.map((rowKey) => (
        <TableRow key={rowKey}>
          {SKELETON_COL_KEYS.map((colKey) => (
            <TableCell key={colKey}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))
    }
    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-destructive">
              <span className="text-sm">Không thể tải dữ liệu. Vui lòng thử lại.</span>
            </div>
          </TableCell>
        </TableRow>
      )
    }
    if (filteredRows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
              {keyword || typeFilter !== 'all' ? (
                <>
                  <SearchX className="h-10 w-10 opacity-40" />
                  <span className="text-sm">Không có kết quả phù hợp</span>
                </>
              ) : (
                <>
                  <DatabaseZap className="h-10 w-10 opacity-40" />
                  <span className="text-sm">Chưa có dữ liệu, bạn hãy tạo mới</span>
                  <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> Thêm mới
                  </Button>
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )
    }
    return filteredRows.map((param, idx) => (
      <TableRow key={param.id}>
        <TableCell className="text-muted-foreground text-sm text-center w-[60px]">
          {page * pageSize + idx + 1}
        </TableCell>
        <TableCell className="font-mono text-sm text-foreground w-[220px]">{param.key}</TableCell>
        <TableCell className="w-[160px]">
          <ParamTypeBadge value={param.value} />
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {param.description ? (
            <span className="line-clamp-2" title={param.description}>
              {param.description}
            </span>
          ) : (
            <span className="opacity-40">—</span>
          )}
        </TableCell>
        <TableCell className="w-[100px]">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setEditParam(param)}
              title="Chỉnh sửa"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeleteParam(param)}
              title="Xoá"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  }

  const pageCount = Math.min(totalPages, 5)
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i)

  return (
    <div className="bg-[#f9fafb] min-h-screen px-8 py-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm">
        <span className="text-muted-foreground">Quản lý danh mục</span>
        <span className="text-muted-foreground/40 px-2">/</span>
        <span className="font-semibold text-foreground">Danh mục tham số</span>
      </div>

      {/* Page title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Danh mục tham số</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý các tham số cấu hình được sử dụng trong hệ thống.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Tìm theo tên tham số hoặc mô tả..."
              value={keyword}
              onChange={handleKeywordChange}
              className="pl-9 h-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className="w-[220px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATA_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="h-10 bg-[#e8192c] hover:bg-[#cc1627] text-white border-0 gap-1.5"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead className="w-[220px]">Tên tham số</TableHead>
              <TableHead className="w-[160px]">Kiểu dữ liệu</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[100px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Tổng số: <span className="font-medium text-foreground">{totalElements}</span> bản ghi
            </span>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>/ trang</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Trang trước"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((pageNum) => (
              <Button
                key={pageNum}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 text-sm font-semibold',
                  page === pageNum && 'bg-[#e8192c] hover:bg-[#cc1627] text-white'
                )}
                onClick={() => setPage(pageNum)}
                disabled={isLoading}
              >
                {pageNum + 1}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Trang sau"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <SystemParameterFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setCreateOpen(false)}
      />

      <SystemParameterFormModal
        open={editParam !== null}
        mode="edit"
        initialData={editParam ?? undefined}
        onClose={() => setEditParam(null)}
        onSuccess={() => setEditParam(null)}
      />

      <DeleteConfirmDialog
        open={deleteParam !== null}
        param={deleteParam}
        onClose={() => setDeleteParam(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
