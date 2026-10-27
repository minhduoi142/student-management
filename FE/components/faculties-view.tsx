"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  BookOpen,
  Building2,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Layers3,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"
import { InitialAvatar, PageHeading, Pagination, RequestBadge } from "@/components/admin-ui"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAcademicData } from "@/components/academic-data-provider"
import { catalogService, statService } from "@/services"
import type { KhoaRequest, KhoaResponse, SiSoLopResponse } from "@/services/types"
import { getErrorMessage, getSuccessMessage } from "@/lib/api-client"

const pageSize = 6

function getFacultyIcon(code: string) {
  const upper = code.toUpperCase()
  if (upper.includes("CNTT") || upper.includes("IT")) return { icon: Building2, color: "text-blue-600 bg-blue-500/10 border-blue-200 dark:border-blue-800" }
  if (upper.includes("ATTT") || upper.includes("SEC")) return { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-500/10 border-emerald-200 dark:border-emerald-800" }
  if (upper.includes("VT") || upper.includes("TEL")) return { icon: Radio, color: "text-violet-600 bg-violet-500/10 border-violet-200 dark:border-violet-800" }
  if (upper.includes("DTVT") || upper.includes("ELEC")) return { icon: Cpu, color: "text-amber-600 bg-amber-500/10 border-amber-200 dark:border-amber-800" }
  return { icon: BookOpen, color: "text-primary bg-primary/10 border-primary/20" }
}

function FacultyFormDialog({
  open,
  onOpenChange,
  faculty,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  faculty: KhoaResponse | null
  onSaved: () => void
}) {
  const [maKhoa, setMaKhoa] = useState("")
  const [tenKhoa, setTenKhoa] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (faculty) {
      setMaKhoa(faculty.maKhoa)
      setTenKhoa(faculty.tenKhoa)
    } else {
      setMaKhoa("")
      setTenKhoa("")
    }
    setErrors({})
    setSubmitting(false)
  }, [open, faculty])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!maKhoa.trim()) errs.maKhoa = "Vui lòng nhập mã khoa."
    if (!tenKhoa.trim()) errs.tenKhoa = "Vui lòng nhập tên khoa."
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const payload: KhoaRequest = {
        maKhoa: maKhoa.trim().toUpperCase(),
        tenKhoa: tenKhoa.trim(),
      }
      if (faculty) {
        const res = await catalogService.updateKhoa(faculty.maKhoa, payload)
        toast.success(getSuccessMessage(res, "Cập nhật khoa thành công."))
      } else {
        const res = await catalogService.createKhoa(payload)
        toast.success(getSuccessMessage(res, "Thêm khoa đào tạo mới thành công."))
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      const msg = getErrorMessage(err, "Không thể lưu thông tin khoa.")
      toast.error(msg)
      setErrors((c) => ({ ...c, maKhoa: msg }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{faculty ? "Chỉnh sửa khoa đào tạo" : "Thêm khoa đào tạo mới"}</DialogTitle>
          <DialogDescription>
            Đơn vị quản lý các chuyên ngành, lớp sinh viên và giảng viên phụ trách.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Field data-invalid={Boolean(errors.maKhoa)}>
            <FieldLabel htmlFor="faculty-code">Mã khoa</FieldLabel>
            <Input
              id="faculty-code"
              value={maKhoa}
              onChange={(e) => {
                setMaKhoa(e.target.value.toUpperCase())
                setErrors((c) => ({ ...c, maKhoa: "" }))
              }}
              placeholder="Ví dụ: CNTT"
              disabled={Boolean(faculty) || submitting}
              className="font-mono"
            />
            <FieldError>{errors.maKhoa}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.tenKhoa)}>
            <FieldLabel htmlFor="faculty-name">Tên khoa</FieldLabel>
            <Input
              id="faculty-name"
              value={tenKhoa}
              onChange={(e) => {
                setTenKhoa(e.target.value)
                setErrors((c) => ({ ...c, tenKhoa: "" }))
              }}
              placeholder="Ví dụ: Công nghệ Thông tin 1"
              disabled={submitting}
            />
            <FieldError>{errors.tenKhoa}</FieldError>
          </Field>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {faculty ? "Lưu thay đổi" : "Thêm khoa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FacultyDetailDialog({
  open,
  onOpenChange,
  faculty,
  onEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  faculty: KhoaResponse | null
  onEdit: () => void
}) {
  const router = useRouter()
  const { classes, lecturers } = useAcademicData()
  const [detailTab, setDetailTab] = useState<"classes" | "lecturers">("classes")

  if (!faculty) return null

  const facultyClasses = classes.filter((c) => c.maKhoa === faculty.maKhoa)
  const facultyLecturers = lecturers.filter((l) => l.maKhoa === faculty.maKhoa)
  const { icon: FacultyIcon, color } = getFacultyIcon(faculty.maKhoa)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-muted/20 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${color} shadow-sm`}>
              <FacultyIcon className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold">{faculty.tenKhoa}</DialogTitle>
                <Badge variant="outline" className="font-mono text-xs font-semibold">
                  {faculty.maKhoa}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Quản lý {facultyClasses.length} lớp học · {facultyLecturers.length} giảng viên công tác
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={detailTab} onValueChange={(v) => setDetailTab(v as any)} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="classes" className="gap-2">
                <Layers3 className="size-4" />
                Lớp học trực thuộc ({facultyClasses.length})
              </TabsTrigger>
              <TabsTrigger value="lecturers" className="gap-2">
                <UserRound className="size-4" />
                Đội ngũ giảng viên ({facultyLecturers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classes">
              {facultyClasses.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {facultyClasses.map((cls) => {
                    const advisor = lecturers.find((l) => l.maGV === cls.maGVCoVan)
                    return (
                      <div
                        key={cls.maLop}
                        className="flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-bold text-foreground">{cls.maLop}</span>
                            <Badge variant="secondary" className="text-[11px]">
                              Khóa {cls.khoaHoc}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{cls.tenLop}</p>
                          <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <UserCheck className="size-3.5 text-primary" />
                            <span>Cố vấn: {advisor ? advisor.hoTen : "Chưa gán"}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-end border-t pt-2.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:text-primary"
                            onClick={() => {
                              onOpenChange(false)
                              router.push(`/sinh-vien?maLop=${cls.maLop}`)
                            }}
                          >
                            Xem sinh viên →
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
                  <Layers3 className="mb-2 size-6 text-muted-foreground/50" />
                  Chưa có lớp học nào được gán cho khoa này.
                </div>
              )}
            </TabsContent>

            <TabsContent value="lecturers">
              {facultyLecturers.length ? (
                <div className="divide-y rounded-xl border bg-card">
                  {facultyLecturers.map((gv) => (
                    <div key={gv.maGV} className="flex items-center justify-between gap-3 p-3.5">
                      <div className="flex items-center gap-3">
                        <InitialAvatar name={gv.hoTen} className="size-9" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{gv.hoTen}</p>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {gv.maGV}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {gv.email} · {gv.soDienThoai}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-center text-sm text-muted-foreground">
                  <UserRound className="mb-2 size-6 text-muted-foreground/50" />
                  Chưa có giảng viên nào công tác tại khoa này.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t bg-muted/10 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              router.push(`/sinh-vien?maKhoa=${faculty.maKhoa}`)
            }}
          >
            <UsersRound data-icon="inline-start" />
            Xem toàn bộ sinh viên khoa này
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEdit()
              }}
            >
              <Pencil data-icon="inline-start" />
              Sửa thông tin khoa
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FacultiesViewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { faculties, classes, lecturers, refreshCatalogs } = useAcademicData()

  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [page, setPage] = useState(1)

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<KhoaResponse | null>(null)
  const [detailFaculty, setDetailFaculty] = useState<KhoaResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<KhoaResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Class sizes map for student counts per faculty
  const [classSizes, setClassSizes] = useState<SiSoLopResponse[]>([])

  const fetchClassSizes = useCallback(async () => {
    try {
      const data = await statService.getSiSoLop()
      setClassSizes(data || [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchClassSizes()
  }, [fetchClassSizes])

  // Map class sizes by maLop
  const sizeMap = useMemo(() => {
    const map = new Map<string, number>()
    classSizes.forEach((item) => {
      map.set(item.maLop, Number(item.siSo) || 0)
    })
    return map
  }, [classSizes])

  // Stats per faculty
  const facultyStats = useMemo(() => {
    const map = new Map<
      string,
      {
        classCount: number
        lecturerCount: number
        studentCount: number
        classes: string[]
        lecturers: string[]
      }
    >()

    faculties.forEach((f) => {
      const fClasses = classes.filter((c) => c.maKhoa === f.maKhoa)
      const fLecturers = lecturers.filter((l) => l.maKhoa === f.maKhoa)
      const totalStudents = fClasses.reduce((sum, c) => sum + (sizeMap.get(c.maLop) || 0), 0)

      map.set(f.maKhoa, {
        classCount: fClasses.length,
        lecturerCount: fLecturers.length,
        studentCount: totalStudents,
        classes: fClasses.map((c) => c.maLop),
        lecturers: fLecturers.map((l) => l.hoTen),
      })
    })

    return map
  }, [faculties, classes, lecturers, sizeMap])

  // Total students overall
  const totalStudentsOverall = useMemo(() => {
    return classSizes.reduce((sum, item) => sum + (Number(item.siSo) || 0), 0)
  }, [classSizes])

  // Largest faculty
  const largestFaculty: KhoaResponse | null = useMemo(() => {
    if (!faculties.length) return null
    let max = -1
    let best: KhoaResponse | null = null
    faculties.forEach((f) => {
      const st = facultyStats.get(f.maKhoa)?.studentCount || 0
      if (st > max) {
        max = st
        best = f
      }
    })
    return best
  }, [faculties, facultyStats])

  // Filtered rows
  const filteredFaculties = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return faculties.filter((f) => {
      if (!q) return true
      return f.maKhoa.toLowerCase().includes(q) || f.tenKhoa.toLowerCase().includes(q)
    })
  }, [faculties, keyword])

  // Pagination
  const totalElements = filteredFaculties.length
  const totalPages = Math.ceil(totalElements / pageSize)
  const pageNo = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const startIdx = (pageNo - 1) * pageSize
  const pageItems = filteredFaculties.slice(startIdx, startIdx + pageSize)

  const openFormDialog = (f: KhoaResponse | null) => {
    setSelectedFaculty(f)
    setFormDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await catalogService.deleteKhoa(deleteTarget.maKhoa)
      toast.success(getSuccessMessage(res, "Xóa khoa thành công."))
      setDeleteTarget(null)
      refreshCatalogs()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa khoa này do còn lớp học hoặc giảng viên phụ thuộc."))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Quản trị · Đơn vị đào tạo"
        title="Quản lý Khoa đào tạo"
        description="Quản lý danh sách các khoa, viện đào tạo; theo dõi quy mô lớp học, đội ngũ giảng viên và sinh viên trực thuộc."
        actions={
          <>
            <RequestBadge>GET /api/v1/khoa</RequestBadge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                refreshCatalogs()
                fetchClassSizes()
                toast.success("Đã làm mới danh mục khoa.")
              }}
            >
              <RefreshCw data-icon="inline-start" />
              Làm mới
            </Button>
            <Button type="button" onClick={() => openFormDialog(null)}>
              <Plus data-icon="inline-start" />
              Thêm khoa đào tạo
            </Button>
          </>
        }
      />

      {/* Top 4 KPI Cards */}
      <section aria-label="Tổng quan khoa" className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{faculties.length}</p>
              <p className="text-xs text-muted-foreground">Khoa & Viện đào tạo</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
              <Layers3 className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{classes.length}</p>
              <p className="text-xs text-muted-foreground">Lớp học trực thuộc</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
              <UserRound className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">{lecturers.length}</p>
              <p className="text-xs text-muted-foreground">Đội ngũ giảng viên</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <GraduationCap className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-foreground">
                {largestFaculty ? (largestFaculty as KhoaResponse).maKhoa : "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {largestFaculty ? `${facultyStats.get((largestFaculty as KhoaResponse).maKhoa)?.studentCount ?? 0} sinh viên` : "Quy mô lớn nhất"}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Filter and View Mode Switcher */}
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm theo mã khoa (CNTT, ATTT...) hoặc tên khoa..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border bg-muted/40 p-1">
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="size-3.5" />
                Dạng thẻ
              </Button>
              <Button
                type="button"
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs"
                onClick={() => setViewMode("table")}
              >
                <List className="size-3.5" />
                Dạng bảng
              </Button>
            </div>

            {keyword ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setKeyword("")}
              >
                <RotateCcw className="size-3.5" />
                Bỏ lọc
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {viewMode === "grid" ? (
        <div>
          {pageItems.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((f) => {
                const stat = facultyStats.get(f.maKhoa) || {
                  classCount: 0,
                  lecturerCount: 0,
                  studentCount: 0,
                  classes: [],
                  lecturers: [],
                }
                const { icon: FacultyIcon, color } = getFacultyIcon(f.maKhoa)
                const percentStudents =
                  totalStudentsOverall > 0
                    ? Math.round((stat.studentCount / totalStudentsOverall) * 100)
                    : 0

                return (
                  <Card
                    key={f.maKhoa}
                    className="group relative flex flex-col justify-between overflow-hidden transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 border-b bg-muted/15 p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${color} shadow-sm transition-transform group-hover:scale-105`}>
                            <FacultyIcon className="size-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground transition-colors group-hover:text-primary">
                                {f.tenKhoa}
                              </h3>
                            </div>
                            <Badge variant="outline" className="mt-1 font-mono text-[11px] font-semibold">
                              {f.maKhoa}
                            </Badge>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label="Thao tác"
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => setDetailFaculty(f)}>
                              <Building2 data-icon="inline-start" />
                              Xem chi tiết khoa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/sinh-vien?maKhoa=${f.maKhoa}`)}>
                              <UsersRound data-icon="inline-start" />
                              Xem sinh viên
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/lop?maKhoa=${f.maKhoa}`)}>
                              <Layers3 data-icon="inline-start" />
                              Xem lớp học
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openFormDialog(f)}>
                              <Pencil data-icon="inline-start" />
                              Sửa khoa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(f)}
                            >
                              <Trash2 data-icon="inline-start" />
                              Xóa khoa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Card Body */}
                      <div className="space-y-4 p-4">
                        {/* 3 Metric Pills */}
                        <div className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/20 p-2.5 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Lớp học</p>
                            <p className="text-base font-bold tabular-nums text-foreground">
                              {stat.classCount}
                            </p>
                          </div>
                          <div className="border-x border-border/60">
                            <p className="text-xs text-muted-foreground">Giảng viên</p>
                            <p className="text-base font-bold tabular-nums text-foreground">
                              {stat.lecturerCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Sinh viên</p>
                            <p className="text-base font-bold tabular-nums text-foreground">
                              {stat.studentCount}
                            </p>
                          </div>
                        </div>

                        {/* Student Proportion Bar */}
                        <div>
                          <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Tỷ trọng sinh viên</span>
                            <span className="font-semibold text-foreground">{percentStudents}% toàn trường</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.max(4, percentStudents)}%` }}
                            />
                          </div>
                        </div>

                        {/* Classes Tags */}
                        <div>
                          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Lớp trực thuộc ({stat.classes.length}):
                          </p>
                          {stat.classes.length ? (
                            <div className="flex flex-wrap gap-1">
                              {stat.classes.slice(0, 4).map((cls) => (
                                <Badge
                                  key={cls}
                                  variant="secondary"
                                  className="cursor-pointer font-mono text-[10px] hover:bg-primary/20"
                                  onClick={() => router.push(`/sinh-vien?maLop=${cls}`)}
                                >
                                  {cls}
                                </Badge>
                              ))}
                              {stat.classes.length > 4 ? (
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer text-[10px] text-muted-foreground hover:bg-muted"
                                  onClick={() => setDetailFaculty(f)}
                                >
                                  +{stat.classes.length - 4} lớp nữa
                                </Badge>
                              ) : null}
                            </div>
                          ) : (
                            <p className="text-xs italic text-muted-foreground">Chưa có lớp</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => router.push(`/sinh-vien?maKhoa=${f.maKhoa}`)}
                      >
                        <UsersRound className="size-3.5" />
                        Xem sinh viên
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => setDetailFaculty(f)}
                      >
                        Chi tiết khoa →
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="flex h-52 flex-col items-center justify-center p-6 text-center">
              <Search className="mb-2 size-8 text-muted-foreground/60" />
              <p className="font-semibold text-foreground">Không tìm thấy khoa nào</p>
              <p className="text-xs text-muted-foreground">Thử nhập từ khóa khác hoặc bấm bỏ lọc.</p>
            </Card>
          )}

          <div className="mt-4">
            <Pagination
              pageNo={pageNo}
              pageSize={pageSize}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[140px]">Mã khoa</TableHead>
                    <TableHead className="w-[280px]">Tên khoa đào tạo</TableHead>
                    <TableHead className="w-[140px]">Số lớp học</TableHead>
                    <TableHead className="w-[140px]">Giảng viên</TableHead>
                    <TableHead className="w-[140px]">Sinh viên</TableHead>
                    <TableHead className="w-[60px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.length ? (
                    pageItems.map((f) => {
                      const stat = facultyStats.get(f.maKhoa) || {
                        classCount: 0,
                        lecturerCount: 0,
                        studentCount: 0,
                        classes: [],
                        lecturers: [],
                      }
                      const { icon: FacultyIcon, color } = getFacultyIcon(f.maKhoa)

                      return (
                        <TableRow key={f.maKhoa} className="hover:bg-muted/30">
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs font-semibold">
                              {f.maKhoa}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${color}`}>
                                <FacultyIcon className="size-4" />
                              </div>
                              <button
                                type="button"
                                className="font-semibold text-foreground hover:text-primary hover:underline text-left"
                                onClick={() => setDetailFaculty(f)}
                              >
                                {f.tenKhoa}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold tabular-nums">{stat.classCount}</span> lớp
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold tabular-nums">{stat.lecturerCount}</span> giảng viên
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono font-semibold">
                              {stat.studentCount} SV
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Thao tác"
                                  />
                                }
                              >
                                <MoreHorizontal />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => setDetailFaculty(f)}>
                                  <Building2 data-icon="inline-start" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/sinh-vien?maKhoa=${f.maKhoa}`)}>
                                  <UsersRound data-icon="inline-start" />
                                  Xem sinh viên
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openFormDialog(f)}>
                                  <Pencil data-icon="inline-start" />
                                  Sửa khoa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setDeleteTarget(f)}
                                >
                                  <Trash2 data-icon="inline-start" />
                                  Xóa khoa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-36 text-center text-sm text-muted-foreground">
                        Không tìm thấy khoa nào phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination
              pageNo={pageNo}
              pageSize={pageSize}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <FacultyFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        faculty={selectedFaculty}
        onSaved={refreshCatalogs}
      />

      {/* Detail Dialog */}
      <FacultyDetailDialog
        open={Boolean(detailFaculty)}
        onOpenChange={(open) => {
          if (!open) setDetailFaculty(null)
        }}
        faculty={detailFaculty}
        onEdit={() => {
          const target = detailFaculty
          setDetailFaculty(null)
          openFormDialog(target)
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khoa đào tạo?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang xóa khoa{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.tenKhoa} ({deleteTarget?.maKhoa})
              </span>
              . Thao tác này chỉ thực hiện được nếu không còn lớp học hoặc giảng viên nào thuộc khoa này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Xóa khoa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function FacultiesView() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <FacultiesViewContent />
    </Suspense>
  )
}
