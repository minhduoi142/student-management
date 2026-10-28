"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Building2,
  GraduationCap,
  Layers3,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"
import { useAcademicData } from "@/components/academic-data-provider"
import { PageHeading, Pagination, RequestBadge } from "@/components/admin-ui"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { catalogService, statService } from "@/services"
import type { LopRequest, LopResponse, SiSoLopResponse } from "@/services/types"
import { getErrorMessage, getSuccessMessage } from "@/lib/api-client"

const pageSize = 8

type ClassFormValues = {
  maLop: string
  tenLop: string
  khoaHoc: number
  maKhoa: string
  maGVCoVan: string
}

const emptyClassForm: ClassFormValues = {
  maLop: "",
  tenLop: "",
  khoaHoc: 2024,
  maKhoa: "",
  maGVCoVan: "",
}

function ClassesViewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlMaKhoa = searchParams?.get("maKhoa")

  const { faculties, lecturers, refreshCatalogs } = useAcademicData()
  const [classes, setClasses] = useState<LopResponse[]>([])
  const [classSizes, setClassSizes] = useState<SiSoLopResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [keyword, setKeyword] = useState("")
  const [facultyFilter, setFacultyFilter] = useState(urlMaKhoa || "all")
  const [cohortFilter, setCohortFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (urlMaKhoa) {
      setFacultyFilter(urlMaKhoa)
    }
  }, [urlMaKhoa])

  // Dialog & Delete State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<LopResponse | null>(null)
  const [formValues, setFormValues] = useState<ClassFormValues>(emptyClassForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<LopResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  const facultyMap = useMemo(() => new Map(faculties.map((f) => [f.maKhoa, f.tenKhoa])), [faculties])
  const lecturerMap = useMemo(() => new Map(lecturers.map((l) => [l.maGV, l.hoTen])), [lecturers])
  const sizeMap = useMemo(() => new Map(classSizes.map((s) => [s.maLop, s.siSo])), [classSizes])

  // Fetch classes and sizes
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    try {
      const [classListRes, siSoRes] = await Promise.allSettled([
        catalogService.getAllLop(),
        statService.getSiSoLop(),
      ])

      if (classListRes.status === "fulfilled") setClasses(classListRes.value || [])
      if (siSoRes.status === "fulfilled") setClassSizes(siSoRes.value || [])

      if (isManual) toast.success("Đã làm mới danh sách lớp học và sĩ số.")
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải dữ liệu lớp học"))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Extract unique cohorts
  const cohorts = useMemo(() => {
    const set = new Set<number>()
    classes.forEach((c) => {
      if (c.khoaHoc) set.add(c.khoaHoc)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [classes])

  // Filtered rows
  const filteredClasses = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return classes.filter((item) => {
      const gvName = lecturerMap.get(item.maGVCoVan ?? "") ?? item.tenGVCoVan ?? ""
      const matchesKeyword =
        !q ||
        item.maLop.toLowerCase().includes(q) ||
        item.tenLop.toLowerCase().includes(q) ||
        gvName.toLowerCase().includes(q)

      const matchesFaculty = facultyFilter === "all" || item.maKhoa === facultyFilter
      const matchesCohort = cohortFilter === "all" || String(item.khoaHoc) === cohortFilter

      return matchesKeyword && matchesFaculty && matchesCohort
    })
  }, [classes, keyword, facultyFilter, cohortFilter, lecturerMap])

  // Pagination
  const totalElements = filteredClasses.length
  const totalPages = Math.ceil(totalElements / pageSize)
  const pageNo = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const startIdx = (pageNo - 1) * pageSize
  const pageItems = filteredClasses.slice(startIdx, startIdx + pageSize)

  // Overall Stats
  const totalStudents = useMemo(() => {
    return classSizes.reduce((sum, item) => sum + (Number(item.siSo) || 0), 0)
  }, [classSizes])

  const largestClass = useMemo(() => {
    if (!classSizes.length) return null
    return [...classSizes].sort((a, b) => b.siSo - a.siSo)[0]
  }, [classSizes])

  // Open Add/Edit Dialog
  const openDialog = (cls: LopResponse | null) => {
    setSelectedClass(cls)
    if (cls) {
      setFormValues({
        maLop: cls.maLop,
        tenLop: cls.tenLop,
        khoaHoc: cls.khoaHoc || 2024,
        maKhoa: cls.maKhoa,
        maGVCoVan: cls.maGVCoVan || "",
      })
    } else {
      setFormValues({
        ...emptyClassForm,
        maKhoa: faculties[0]?.maKhoa ?? "",
        maGVCoVan: "",
      })
    }
    setErrors({})
    setDialogOpen(true)
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    if (!formValues.maLop.trim()) nextErrors.maLop = "Vui lòng nhập mã lớp."
    if (!formValues.tenLop.trim()) nextErrors.tenLop = "Vui lòng nhập tên lớp."
    if (!formValues.khoaHoc || formValues.khoaHoc < 2000 || formValues.khoaHoc > 2100) {
      nextErrors.khoaHoc = "Năm khóa học phải từ 2000 đến 2100."
    }
    if (!formValues.maKhoa) nextErrors.maKhoa = "Vui lòng chọn khoa phụ trách."

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const payload: LopRequest = {
        maLop: formValues.maLop.trim().toUpperCase(),
        tenLop: formValues.tenLop.trim(),
        khoaHoc: Number(formValues.khoaHoc),
        maKhoa: formValues.maKhoa,
        maGVCoVan: formValues.maGVCoVan ? formValues.maGVCoVan : undefined,
      }

      if (selectedClass) {
        const res = await catalogService.updateLop(selectedClass.maLop, payload)
        toast.success(getSuccessMessage(res, "Cập nhật lớp học thành công."))
      } else {
        const res = await catalogService.createLop(payload)
        toast.success(getSuccessMessage(res, "Tạo lớp học mới thành công."))
        // Reset bộ lọc để lớp vừa thêm luôn xuất hiện ngay lập tức
        setKeyword("")
        setFacultyFilter("all")
        setCohortFilter("all")
        setPage(1)
      }

      setDialogOpen(false)
      fetchData()
      refreshCatalogs()
    } catch (err) {
      const msg = getErrorMessage(err, "Không thể lưu thông tin lớp học.")
      toast.error(msg)
      setErrors((curr) => ({ ...curr, maLop: msg }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClass = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await catalogService.deleteLop(deleteTarget.maLop)
      toast.success(getSuccessMessage(res, "Xóa lớp học thành công."))
      setDeleteTarget(null)
      fetchData()
      refreshCatalogs()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa lớp học này do còn sinh viên."))
    } finally {
      setDeleting(false)
    }
  }

  const resetFilters = () => {
    setKeyword("")
    setFacultyFilter("all")
    setCohortFilter("all")
    setPage(1)
    toast.success("Bộ lọc lớp học đã được làm mới.")
  }

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Đào tạo · Cơ cấu tổ chức"
        title="Quản lý lớp học"
        description="Theo dõi danh sách lớp học chính quy, cập nhật cố vấn học tập và quản lý sĩ số sinh viên thời gian thực."
        actions={
          <>
            <RequestBadge>REST API: /api/v1/lop</RequestBadge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={loading || refreshing}
            >
              <RefreshCw className={refreshing ? "animate-spin" : ""} data-icon="inline-start" />
              Làm mới
            </Button>
            <Button type="button" onClick={() => openDialog(null)}>
              <Plus data-icon="inline-start" />
              Thêm lớp học
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <section aria-label="Thống kê lớp học" className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3.5 p-4">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers3 className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {loading ? "..." : classes.length.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-muted-foreground">Tổng số lớp học</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3.5 p-4">
            <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
              <UsersRound className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {loading ? "..." : totalStudents.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-muted-foreground">Tổng sinh viên toàn trường</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3.5 p-4">
            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <UserCheck className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {loading ? "..." : classes.length ? Math.round(totalStudents / classes.length) : 0}
              </p>
              <p className="text-xs text-muted-foreground">Sĩ số trung bình / lớp</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3.5 p-4">
            <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold">
                {loading ? "..." : largestClass ? `${largestClass.maLop} (${largestClass.siSo} SV)` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Lớp có sĩ số đông nhất</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Control bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <label htmlFor="class-search" className="sr-only">
                Tìm kiếm lớp
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="class-search"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm theo mã lớp, tên lớp, cố vấn..."
                className="pl-10"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <label htmlFor="class-faculty-filter" className="sr-only">
                Lọc theo khoa
              </label>
              <Select
                value={facultyFilter}
                onValueChange={(val) => {
                  setFacultyFilter(val ?? "all")
                  setPage(1)
                }}
              >
                <SelectTrigger id="class-faculty-filter" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tất cả khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả khoa</SelectItem>
                    {faculties.map((f) => (
                      <SelectItem key={f.maKhoa} value={f.maKhoa}>
                        {f.tenKhoa}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <label htmlFor="class-cohort-filter" className="sr-only">
                Lọc theo khóa
              </label>
              <Select
                value={cohortFilter}
                onValueChange={(val) => {
                  setCohortFilter(val ?? "all")
                  setPage(1)
                }}
              >
                <SelectTrigger id="class-cohort-filter" className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Tất cả khóa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả khóa</SelectItem>
                    {cohorts.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        Khóa {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw data-icon="inline-start" />
                Làm mới
              </Button>

              <div className="hidden border-l pl-2 sm:flex sm:items-center sm:gap-1">
                <Button
                  type="button"
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("table")}
                  title="Chế độ bảng"
                >
                  <List className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("grid")}
                  title="Chế độ thẻ"
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[170px]">Mã lớp</TableHead>
                    <TableHead>Tên lớp học</TableHead>
                    <TableHead className="w-[120px]">Khóa</TableHead>
                    <TableHead>Khoa phụ trách</TableHead>
                    <TableHead>Cố vấn học tập</TableHead>
                    <TableHead className="w-[160px] text-center">Sĩ số sinh viên</TableHead>
                    <TableHead className="w-[80px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-44 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="size-5 animate-spin" />
                          <span>Đang tải danh sách lớp học...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : pageItems.length ? (
                    pageItems.map((cls) => {
                      const facultyName = cls.tenKhoa || facultyMap.get(cls.maKhoa) || cls.maKhoa
                      const advisorName = cls.tenGVCoVan || (cls.maGVCoVan ? lecturerMap.get(cls.maGVCoVan) : null)
                      const size = sizeMap.get(cls.maLop) ?? 0

                      return (
                        <TableRow key={cls.maLop} className="transition-colors hover:bg-muted/50">
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs font-semibold">
                              {cls.maLop}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-foreground">{cls.tenLop}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-medium">
                              Khóa {cls.khoaHoc || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="block max-w-[190px] truncate">{facultyName}</span>
                            <span className="text-xs text-muted-foreground">{cls.maKhoa}</span>
                          </TableCell>
                          <TableCell>
                            {advisorName ? (
                              <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                  GV
                                </span>
                                <div>
                                  <p className="text-sm font-medium leading-tight">{advisorName}</p>
                                  <p className="text-xs text-muted-foreground">{cls.maGVCoVan}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Chưa gán cố vấn</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="mx-auto flex max-w-[120px] flex-col items-center gap-1">
                              <span className="font-semibold tabular-nums text-foreground">
                                {size}{" "}
                                <span className="text-xs font-normal text-muted-foreground">SV</span>
                              </span>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-300"
                                  style={{ width: `${Math.min(100, (size / 40) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Thao tác với lớp ${cls.maLop}`}
                                  />
                                }
                              >
                                <MoreHorizontal />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/sinh-vien?maLop=${encodeURIComponent(cls.maLop)}`)}
                                >
                                  <UsersRound data-icon="inline-start" />
                                  Xem danh sách sinh viên
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDialog(cls)}>
                                  <Pencil data-icon="inline-start" />
                                  Chỉnh sửa lớp
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(cls)}>
                                  <Trash2 data-icon="inline-start" />
                                  Xóa lớp học
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-44 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                          <Search aria-hidden="true" />
                          <p className="font-medium text-foreground">Không tìm thấy lớp học</p>
                          <p className="text-sm">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc khoa, khóa.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Grid View */
            <div className="p-4">
              {loading ? (
                <div className="flex h-44 items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải danh sách lớp học...
                </div>
              ) : pageItems.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pageItems.map((cls) => {
                    const facultyName = cls.tenKhoa || facultyMap.get(cls.maKhoa) || cls.maKhoa
                    const advisorName = cls.tenGVCoVan || (cls.maGVCoVan ? lecturerMap.get(cls.maGVCoVan) : null)
                    const size = sizeMap.get(cls.maLop) ?? 0

                    return (
                      <Card key={cls.maLop} className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="font-mono text-xs font-semibold">
                              {cls.maLop}
                            </Badge>
                            <Badge variant="secondary">Khóa {cls.khoaHoc}</Badge>
                          </div>
                          <CardTitle className="mt-2 text-base font-semibold">{cls.tenLop}</CardTitle>
                          <CardDescription className="truncate text-xs">{facultyName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0 text-sm">
                          <div className="rounded-lg bg-muted/40 p-2.5">
                            <p className="text-xs text-muted-foreground">Cố vấn học tập</p>
                            <p className="font-medium text-foreground">{advisorName || "Chưa phân công"}</p>
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Sĩ số sinh viên</span>
                              <span className="font-semibold text-foreground">{size} SV</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.min(100, (size / 40) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary"
                              onClick={() => router.push(`/sinh-vien?maLop=${encodeURIComponent(cls.maLop)}`)}
                            >
                              <UsersRound className="mr-1 size-3.5" /> Xem sinh viên
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openDialog(cls)}
                                title="Sửa"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive"
                                onClick={() => setDeleteTarget(cls)}
                                title="Xóa"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Không tìm thấy lớp học phù hợp.
                </div>
              )}
            </div>
          )}

          <Pagination
            pageNo={pageNo}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-5 py-4 sm:px-6">
            <DialogTitle>{selectedClass ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}</DialogTitle>
            <DialogDescription>
              Thông tin lớp học được kiểm tra và lưu trực tiếp vào cơ sở dữ liệu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 sm:px-6">
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.maLop)}>
                <FieldLabel htmlFor="class-code">Mã lớp học</FieldLabel>
                <Input
                  id="class-code"
                  value={formValues.maLop}
                  onChange={(e) => {
                    setFormValues((curr) => ({ ...curr, maLop: e.target.value.toUpperCase() }))
                    setErrors((curr) => ({ ...curr, maLop: "" }))
                  }}
                  placeholder="Ví dụ: D24CQCE02-B"
                  disabled={Boolean(selectedClass) || submitting}
                  aria-invalid={Boolean(errors.maLop)}
                />
                <FieldError>{errors.maLop}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.khoaHoc)}>
                <FieldLabel htmlFor="class-cohort">Năm tuyển sinh (Khóa)</FieldLabel>
                <Input
                  id="class-cohort"
                  type="number"
                  min="2000"
                  max="2100"
                  value={formValues.khoaHoc}
                  onChange={(e) => {
                    setFormValues((curr) => ({ ...curr, khoaHoc: Number(e.target.value) || 2024 }))
                    setErrors((curr) => ({ ...curr, khoaHoc: "" }))
                  }}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.khoaHoc)}
                />
                <FieldError>{errors.khoaHoc}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.tenLop)} className="sm:col-span-2">
                <FieldLabel htmlFor="class-name">Tên lớp học</FieldLabel>
                <Input
                  id="class-name"
                  value={formValues.tenLop}
                  onChange={(e) => {
                    setFormValues((curr) => ({ ...curr, tenLop: e.target.value }))
                    setErrors((curr) => ({ ...curr, tenLop: "" }))
                  }}
                  placeholder="Kỹ thuật Máy tính 02 - Khóa 2024"
                  disabled={submitting}
                  aria-invalid={Boolean(errors.tenLop)}
                />
                <FieldError>{errors.tenLop}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.maKhoa)} className="sm:col-span-2">
                <FieldLabel htmlFor="class-faculty">Khoa phụ trách</FieldLabel>
                <Select
                  value={formValues.maKhoa}
                  onValueChange={(val) => {
                    setFormValues((curr) => ({ ...curr, maKhoa: val ?? "" }))
                    setErrors((curr) => ({ ...curr, maKhoa: "" }))
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger id="class-faculty" className="w-full" aria-invalid={Boolean(errors.maKhoa)}>
                    <SelectValue placeholder="Chọn khoa phụ trách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {faculties.map((f) => (
                        <SelectItem key={f.maKhoa} value={f.maKhoa}>
                          {f.maKhoa} · {f.tenKhoa}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.maKhoa}</FieldError>
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="class-advisor">Giảng viên cố vấn học tập</FieldLabel>
                <Select
                  value={formValues.maGVCoVan || "NONE"}
                  onValueChange={(val) => setFormValues((curr) => ({ ...curr, maGVCoVan: val === "NONE" ? "" : (val ?? "") }))}
                  disabled={submitting}
                >
                  <SelectTrigger id="class-advisor" className="w-full">
                    <SelectValue placeholder="Chọn cố vấn học tập (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="NONE">— Chưa phân công —</SelectItem>
                      {lecturers.map((l) => (
                        <SelectItem key={l.maGV} value={l.maGV}>
                          {l.maGV} · {l.hoTen} ({l.tenKhoa || l.maKhoa})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <DialogFooter className="-mx-5 -mb-5 border-t px-5 py-4 sm:-mx-6 sm:-mb-5 sm:px-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {selectedClass ? "Lưu thay đổi" : "Thêm lớp học"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa lớp học?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang xóa lớp{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.tenLop} ({deleteTarget?.maLop})
              </span>
              . Lưu ý: Lớp học chỉ có thể xóa khi không còn sinh viên nào đang theo học.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteClass} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Xóa lớp học
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function ClassesView() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ClassesViewContent />
    </Suspense>
  )
}
