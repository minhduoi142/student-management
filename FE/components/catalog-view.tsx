"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Landmark,
  Layers3,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  type LucideIcon,
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
import { Card, CardContent } from "@/components/ui/card"
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { catalogService, statService } from "@/services"
import type { CatalogResource } from "@/components/academic-data-provider"
import { useAcademicData } from "@/components/academic-data-provider"
import { getErrorMessage, getSuccessMessage } from "@/lib/api-client"
import type { DiemTrungBinhMonResponse, MonHocResponse, ThongKeHocKyResponse } from "@/services/types"

const pageSize = 8

type CatalogField = {
  key: string
  label: string
  type?: "text" | "number" | "email" | "tel" | "select"
  placeholder?: string
  options?: { value: string; label: string }[]
}

const catalogConfig: Record<
  CatalogResource,
  {
    title: string
    description: string
    primaryKey: string
    fields: Omit<CatalogField, "options">[]
  }
> = {
  lop: {
    title: "Lớp học",
    description: "Quản lý lớp, khóa tuyển sinh, khoa phụ trách và cố vấn học tập.",
    primaryKey: "maLop",
    fields: [
      { key: "maLop", label: "Mã lớp", placeholder: "Ví dụ: D24CQCE02-B" },
      { key: "tenLop", label: "Tên lớp", placeholder: "Kỹ thuật máy tính 02" },
      { key: "khoaHoc", label: "Khóa tuyển sinh", type: "number", placeholder: "2024" },
      { key: "maKhoa", label: "Khoa phụ trách", type: "select" },
      { key: "maGVCoVan", label: "Cố vấn học tập", type: "select" },
    ],
  },
  khoa: {
    title: "Khoa đào tạo",
    description: "Danh mục các đơn vị đào tạo, viện và khoa chuyên môn quản lý sinh viên.",
    primaryKey: "maKhoa",
    fields: [
      { key: "maKhoa", label: "Mã khoa", placeholder: "Ví dụ: CNTT" },
      { key: "tenKhoa", label: "Tên khoa", placeholder: "Công nghệ thông tin 1" },
    ],
  },
  "mon-hoc": {
    title: "Môn học & Học phần",
    description: "Danh mục học phần đào tạo, số tín chỉ và theo dõi kết quả thi kết thúc môn.",
    primaryKey: "maMH",
    fields: [
      { key: "maMH", label: "Mã môn học", placeholder: "Ví dụ: INT1313" },
      { key: "tenMH", label: "Tên môn học", placeholder: "Cơ sở dữ liệu" },
      { key: "soTinChi", label: "Số tín chỉ", type: "number", placeholder: "3" },
    ],
  },
  "giang-vien": {
    title: "Giảng viên",
    description: "Hồ sơ liên hệ, khoa chuyên môn và nhiệm vụ cố vấn học tập của giảng viên.",
    primaryKey: "maGV",
    fields: [
      { key: "maGV", label: "Mã giảng viên", placeholder: "Ví dụ: GV01" },
      { key: "hoTen", label: "Họ và tên", placeholder: "TS. Nguyễn Văn A" },
      { key: "email", label: "Email", type: "email", placeholder: "nguyenvana@qlsv.edu.vn" },
      { key: "soDienThoai", label: "Số điện thoại", type: "tel", placeholder: "0987654321" },
      { key: "maKhoa", label: "Khoa công tác", type: "select" },
    ],
  },
  "hoc-ky": {
    title: "Học kỳ & Năm học",
    description: "Thiết lập các mốc học kỳ, năm học và thống kê tiến độ chấm điểm học vụ.",
    primaryKey: "maHK",
    fields: [
      { key: "maHK", label: "Mã học kỳ", placeholder: "Ví dụ: 2025-1" },
      { key: "namHoc", label: "Năm học (yyyy-yyyy)", placeholder: "2025-2026" },
      { key: "ky", label: "Kỳ đào tạo (1, 2, 3)", type: "number", placeholder: "1" },
    ],
  },
}

const catalogTabs: { key: CatalogResource; label: string; icon: LucideIcon }[] = [
  { key: "khoa", label: "Khoa", icon: Landmark },
  { key: "mon-hoc", label: "Môn học", icon: BookOpen },
  { key: "giang-vien", label: "Giảng viên", icon: UserRound },
  { key: "hoc-ky", label: "Học kỳ", icon: CalendarDays },
  { key: "lop", label: "Lớp học", icon: Layers3 },
]

function readRecord(record: any, key: string): string | number {
  return record?.[key] ?? ""
}

function getCatalogFields(
  resource: CatalogResource,
  faculties: { maKhoa: string; tenKhoa: string }[],
  lecturers: { maGV: string; hoTen: string }[]
): CatalogField[] {
  const fields = catalogConfig[resource].fields
  return fields.map((field) => {
    if (field.key === "maKhoa") {
      return {
        ...field,
        options: faculties.map((faculty) => ({
          value: faculty.maKhoa,
          label: `${faculty.maKhoa} · ${faculty.tenKhoa}`,
        })),
      }
    }
    if (field.key === "maGVCoVan") {
      return {
        ...field,
        options: [
          { value: "NONE", label: "— Không gán cố vấn —" },
          ...lecturers.map((lecturer) => ({
            value: lecturer.maGV,
            label: `${lecturer.maGV} · ${lecturer.hoTen}`,
          })),
        ],
      }
    }
    return field
  })
}

function CatalogFormDialog({
  open,
  onOpenChange,
  resource,
  record,
  fields,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: CatalogResource
  record: any | null
  fields: CatalogField[]
  onSaved: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const config = catalogConfig[resource]

  useEffect(() => {
    if (!open) return
    const nextValues = Object.fromEntries(
      fields.map((field) => [
        field.key,
        record ? String(readRecord(record, field.key)) : field.type === "select" ? field.options?.[0]?.value ?? "" : "",
      ])
    )
    setValues(nextValues)
    setErrors({})
    setSubmitting(false)
  }, [open, record, fields])

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.key === "maGVCoVan") return

      const value = values[field.key]?.trim() ?? ""
      if (!value) nextErrors[field.key] = "Trường này không được để trống."
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        nextErrors[field.key] = "Email chưa đúng định dạng."
      }
      if (field.type === "tel" && value && !/^0\d{9}$/.test(value)) {
        nextErrors[field.key] = "Số điện thoại cần gồm 10 chữ số và bắt đầu bằng 0."
      }
      if (field.key === "soTinChi" && value && (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 10)) {
        nextErrors[field.key] = "Số tín chỉ cần là số nguyên từ 1 đến 10."
      }
      if (field.key === "namHoc" && value && !/^\d{4}-\d{4}$/.test(value)) {
        nextErrors[field.key] = "Năm học phải theo định dạng yyyy-yyyy (ví dụ: 2024-2025)."
      }
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const isEdit = Boolean(record)
      const primaryKeyVal = record ? String(readRecord(record, config.primaryKey)) : ""

      if (resource === "lop") {
        const payload = {
          maLop: values.maLop.trim().toUpperCase(),
          tenLop: values.tenLop.trim(),
          khoaHoc: Number(values.khoaHoc) || 2024,
          maKhoa: values.maKhoa,
          maGVCoVan: values.maGVCoVan && values.maGVCoVan !== "NONE" ? values.maGVCoVan.trim() : undefined,
        }
        const res = isEdit
          ? await catalogService.updateLop(primaryKeyVal, payload)
          : await catalogService.createLop(payload)
        toast.success(getSuccessMessage(res, isEdit ? "Cập nhật lớp thành công" : "Tạo lớp thành công"))
      } else if (resource === "khoa") {
        const payload = {
          maKhoa: values.maKhoa.trim().toUpperCase(),
          tenKhoa: values.tenKhoa.trim(),
        }
        const res = isEdit
          ? await catalogService.updateKhoa(primaryKeyVal, payload)
          : await catalogService.createKhoa(payload)
        toast.success(getSuccessMessage(res, isEdit ? "Cập nhật khoa thành công" : "Tạo khoa thành công"))
      } else if (resource === "mon-hoc") {
        const payload = {
          maMH: values.maMH.trim().toUpperCase(),
          tenMH: values.tenMH.trim(),
          soTinChi: Number(values.soTinChi) || 3,
        }
        const res = isEdit
          ? await catalogService.updateMonHoc(primaryKeyVal, payload)
          : await catalogService.createMonHoc(payload)
        toast.success(getSuccessMessage(res, isEdit ? "Cập nhật môn học thành công" : "Tạo môn học thành công"))
      } else if (resource === "giang-vien") {
        const payload = {
          maGV: values.maGV.trim().toUpperCase(),
          hoTen: values.hoTen.trim(),
          email: values.email.trim(),
          soDienThoai: values.soDienThoai.trim(),
          maKhoa: values.maKhoa,
        }
        const res = isEdit
          ? await catalogService.updateGiangVien(primaryKeyVal, payload)
          : await catalogService.createGiangVien(payload)
        toast.success(getSuccessMessage(res, isEdit ? "Cập nhật giảng viên thành công" : "Tạo giảng viên thành công"))
      } else if (resource === "hoc-ky") {
        const payload = {
          maHK: values.maHK.trim(),
          namHoc: values.namHoc.trim(),
          ky: Number(values.ky) || 1,
        }
        const res = isEdit
          ? await catalogService.updateHocKy(primaryKeyVal, payload)
          : await catalogService.createHocKy(payload)
        toast.success(getSuccessMessage(res, isEdit ? "Cập nhật học kỳ thành công" : "Tạo học kỳ thành công"))
      }

      onOpenChange(false)
      onSaved()
    } catch (err) {
      const msg = getErrorMessage(err, "Thao tác danh mục thất bại")
      toast.error(msg)
      setErrors((current) => ({ ...current, [config.primaryKey]: msg }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4 sm:px-6">
          <DialogTitle>
            {record
              ? `Chỉnh sửa ${config.title.toLocaleLowerCase("vi-VN")}`
              : `Thêm ${config.title.toLocaleLowerCase("vi-VN")}`}
          </DialogTitle>
          <DialogDescription>
            Dữ liệu được lưu trực tiếp vào cơ sở dữ liệu qua REST API backend.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 sm:px-6">
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <Field
                key={field.key}
                data-invalid={Boolean(errors[field.key])}
                className={field.type === "select" ? "sm:col-span-2" : undefined}
              >
                <FieldLabel htmlFor={`catalog-${field.key}`}>{field.label}</FieldLabel>
                {field.type === "select" ? (
                  <Select
                    value={values[field.key] ?? ""}
                    onValueChange={(value) => updateValue(field.key, value ?? "")}
                    disabled={submitting}
                  >
                    <SelectTrigger id={`catalog-${field.key}`} className="w-full" aria-invalid={Boolean(errors[field.key])}>
                      <SelectValue placeholder={`Chọn ${field.label.toLocaleLowerCase("vi-VN")}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`catalog-${field.key}`}
                    type={field.type ?? "text"}
                    inputMode={field.type === "tel" ? "numeric" : undefined}
                    min={field.key === "soTinChi" ? 1 : undefined}
                    max={field.key === "soTinChi" ? 10 : undefined}
                    step={field.key === "soTinChi" ? 1 : undefined}
                    value={values[field.key] ?? ""}
                    onChange={(event) =>
                      updateValue(
                        field.key,
                        field.type === "tel"
                          ? event.target.value.replace(/\D/g, "").slice(0, 10)
                          : event.target.value
                      )
                    }
                    placeholder={field.placeholder}
                    disabled={submitting || (Boolean(record) && field.key === config.primaryKey)}
                    aria-invalid={Boolean(errors[field.key])}
                  />
                )}
                <FieldError>{errors[field.key]}</FieldError>
              </Field>
            ))}
          </FieldGroup>
          <DialogFooter className="-mx-5 -mb-5 border-t px-5 py-4 sm:-mx-6 sm:-mb-5 sm:px-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {record ? "Lưu thay đổi" : "Thêm danh mục"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CatalogView({ resource }: { resource: CatalogResource }) {
  const router = useRouter()
  const { faculties, lecturers, classes, refreshCatalogs } = useAcademicData()
  const config = catalogConfig[resource]
  const fields = useMemo(() => getCatalogFields(resource, faculties, lecturers), [resource, faculties, lecturers])

  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Extra insight stats
  const [courseAverages, setCourseAverages] = useState<Map<string, number>>(new Map())
  const [noGradeCourseCodes, setNoGradeCourseCodes] = useState<Set<string>>(new Set())
  const [semesterGradeCounts, setSemesterGradeCounts] = useState<Map<string, number>>(new Map())

  const facultyNameByCode = useMemo(() => new Map(faculties.map((f) => [f.maKhoa, f.tenKhoa])), [faculties])
  const lecturerNameByCode = useMemo(() => new Map(lecturers.map((l) => [l.maGV, l.hoTen])), [lecturers])

  // Count classes and lecturers per faculty
  const classCountByFaculty = useMemo(() => {
    const map = new Map<string, number>()
    classes.forEach((c) => {
      map.set(c.maKhoa, (map.get(c.maKhoa) || 0) + 1)
    })
    return map
  }, [classes])

  const lecturerCountByFaculty = useMemo(() => {
    const map = new Map<string, number>()
    lecturers.forEach((l) => {
      map.set(l.maKhoa, (map.get(l.maKhoa) || 0) + 1)
    })
    return map
  }, [lecturers])

  // Advised classes per lecturer
  const advisedClassesByLecturer = useMemo(() => {
    const map = new Map<string, string[]>()
    classes.forEach((c) => {
      if (c.maGVCoVan) {
        const list = map.get(c.maGVCoVan) || []
        list.push(c.maLop)
        map.set(c.maGVCoVan, list)
      }
    })
    return map
  }, [classes])

  const fetchCatalogData = useCallback(async () => {
    setLoading(true)
    try {
      let data: any[] = []
      if (resource === "lop") {
        data = await catalogService.getAllLop(facultyFilter === "all" ? undefined : facultyFilter)
      } else if (resource === "khoa") {
        data = await catalogService.getAllKhoa()
      } else if (resource === "mon-hoc") {
        const [monHocList, avgRes, noGradeRes] = await Promise.allSettled([
          catalogService.getAllMonHoc(),
          statService.getDiemTrungBinhMon(),
          statService.getMonHocChuaCoKetQua(),
        ])
        data = monHocList.status === "fulfilled" ? monHocList.value || [] : []

        if (avgRes.status === "fulfilled" && avgRes.value) {
          const map = new Map<string, number>()
          avgRes.value.forEach((item) => {
            map.set(item.maMH, item.diemCKTrungBinh)
          })
          setCourseAverages(map)
        }
        if (noGradeRes.status === "fulfilled" && noGradeRes.value) {
          setNoGradeCourseCodes(new Set(noGradeRes.value.map((m) => m.maMH)))
        }
      } else if (resource === "giang-vien") {
        data = await catalogService.getAllGiangVien(facultyFilter === "all" ? undefined : facultyFilter)
      } else if (resource === "hoc-ky") {
        const [hocKyList, statRes] = await Promise.allSettled([
          catalogService.getAllHocKy(),
          statService.getSoLuongDiemTheoHocKy(),
        ])
        data = hocKyList.status === "fulfilled" ? hocKyList.value || [] : []

        if (statRes.status === "fulfilled" && statRes.value) {
          const countMap = new Map<string, number>()
          statRes.value.forEach((item) => {
            countMap.set(item.maHK, item.soLuongKetQua)
          })
          setSemesterGradeCounts(countMap)
        }
      }
      setRows(data || [])
    } catch (err) {
      toast.error(getErrorMessage(err, `Không thể tải danh sách ${config.title.toLowerCase()}`))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [resource, facultyFilter, config.title])

  useEffect(() => {
    fetchCatalogData()
  }, [fetchCatalogData])

  const filteredRows = useMemo(() => {
    const normalized = keyword.trim().toLocaleLowerCase("vi-VN")
    return rows.filter((record) => {
      const values = Object.values(record as Record<string, string | number>).join(" ").toLocaleLowerCase("vi-VN")
      const matchesSearch = !normalized || values.includes(normalized)
      const matchesFaculty =
        facultyFilter === "all" ||
        readRecord(record, "maKhoa") === facultyFilter
      return matchesSearch && matchesFaculty
    })
  }, [rows, keyword, facultyFilter])

  // In-memory pagination for catalog items
  const totalElements = filteredRows.length
  const totalPages = Math.ceil(totalElements / pageSize)
  const pageNo = Math.min(Math.max(1, page), Math.max(1, totalPages))
  const start = (pageNo - 1) * pageSize
  const pageContent = filteredRows.slice(start, start + pageSize)

  const handleDelete = async () => {
    if (!deleteTarget) return
    const keyVal = String(readRecord(deleteTarget, config.primaryKey))
    setDeleting(true)
    try {
      let res: any
      if (resource === "lop") res = await catalogService.deleteLop(keyVal)
      else if (resource === "khoa") res = await catalogService.deleteKhoa(keyVal)
      else if (resource === "mon-hoc") res = await catalogService.deleteMonHoc(keyVal)
      else if (resource === "giang-vien") res = await catalogService.deleteGiangVien(keyVal)
      else if (resource === "hoc-ky") res = await catalogService.deleteHocKy(keyVal)

      toast.success(getSuccessMessage(res, "Xóa danh mục thành công"))
      setDeleteTarget(null)
      fetchCatalogData()
      refreshCatalogs()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa bản ghi danh mục"))
    } finally {
      setDeleting(false)
    }
  }

  const handleSaved = () => {
    setKeyword("")
    setFacultyFilter("all")
    setPage(1)
    fetchCatalogData()
    refreshCatalogs()
  }

  const resetFilters = () => {
    setKeyword("")
    setFacultyFilter("all")
    setPage(1)
    toast.success("Bộ lọc đã được làm mới.")
  }

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Quản trị · Danh mục hệ thống"
        title={config.title}
        description={config.description}
        actions={<RequestBadge>GET /api/v1/{resource}</RequestBadge>}
      />

      <Tabs
        value={resource}
        onValueChange={(value) => {
          if (value === "lop") {
            router.push("/lop")
          } else {
            router.push(`/${value}`)
          }
        }}
      >
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl p-1 md:w-fit">
          {catalogTabs.map((tab) => {
            const Icon = tab.icon
            const isLop = tab.key === "lop"
            return (
              <TabsTrigger key={tab.key} value={tab.key} className="shrink-0 gap-2 px-3.5 py-2">
                <Icon className="size-4" />
                {tab.label}
                {isLop ? (
                  <Badge variant="outline" className="ml-1 text-[10px] uppercase tracking-wider text-primary">
                    Mới
                  </Badge>
                ) : null}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={resource} className="mt-5">
          <section aria-label={`Tóm tắt ${config.title.toLocaleLowerCase("vi-VN")}`} className="mb-4 grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers3 aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xl font-semibold tabular-nums">{loading ? "..." : rows.length}</p>
                  <p className="text-xs text-muted-foreground">Tổng bản ghi trong danh mục</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  <UsersRound aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xl font-semibold tabular-nums">{filteredRows.length}</p>
                  <p className="text-xs text-muted-foreground">Khớp kết quả tìm kiếm</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Search aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xl font-semibold tabular-nums">{pageContent.length}</p>
                  <p className="text-xs text-muted-foreground">Bản ghi hiển thị trên trang</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-sm">
                  <label className="sr-only" htmlFor="catalog-search">
                    Tìm kiếm {config.title.toLocaleLowerCase("vi-VN")}
                  </label>
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="catalog-search"
                    value={keyword}
                    onChange={(event) => {
                      setKeyword(event.target.value)
                      setPage(1)
                    }}
                    placeholder={`Tìm kiếm trong ${config.title.toLocaleLowerCase("vi-VN")}...`}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  {resource === "giang-vien" || resource === "lop" ? (
                    <>
                      <label htmlFor="catalog-faculty-filter" className="sr-only">
                        Lọc theo khoa
                      </label>
                      <Select
                        value={facultyFilter}
                        onValueChange={(value) => {
                          setFacultyFilter(value ?? "all")
                          setPage(1)
                        }}
                      >
                        <SelectTrigger id="catalog-faculty-filter" className="w-full sm:w-[205px]">
                          <SelectValue placeholder="Tất cả khoa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">Tất cả khoa</SelectItem>
                            {faculties.map((faculty) => (
                              <SelectItem key={faculty.maKhoa} value={faculty.maKhoa}>
                                {faculty.tenKhoa}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </>
                  ) : null}
                  <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                    <RotateCcw data-icon="inline-start" />
                    Làm mới
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedRecord(null)
                      setDialogOpen(true)
                    }}
                  >
                    <Plus data-icon="inline-start" />
                    Thêm {config.title.toLocaleLowerCase("vi-VN")}
                  </Button>
                </div>
              </div>

              {/* Table Rendering Based on Resource */}
              <div className="overflow-x-auto">
                {resource === "khoa" ? (
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[140px]">Mã khoa</TableHead>
                        <TableHead className="w-[300px]">Tên khoa</TableHead>
                        <TableHead className="w-[160px]">Lớp trực thuộc</TableHead>
                        <TableHead className="w-[160px]">Giảng viên</TableHead>
                        <TableHead className="w-[60px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-40 text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="size-5 animate-spin" />
                              <span>Đang tải danh sách khoa...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : pageContent.length ? (
                        pageContent.map((f: any) => {
                          const lopCount = classCountByFaculty.get(f.maKhoa) || 0
                          const gvCount = lecturerCountByFaculty.get(f.maKhoa) || 0
                          return (
                            <TableRow key={f.maKhoa} className="hover:bg-muted/30">
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs font-semibold">
                                  {f.maKhoa}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-foreground">{f.tenKhoa}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1.5 text-sm">
                                  <Layers3 className="size-3.5 text-muted-foreground" />
                                  <span className="font-semibold">{lopCount}</span> lớp học
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1.5 text-sm">
                                  <UserRound className="size-3.5 text-muted-foreground" />
                                  <span className="font-semibold">{gvCount}</span> giảng viên
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Thao tác với khoa ${f.tenKhoa}`}
                                      />
                                    }
                                  >
                                    <MoreHorizontal />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRecord(f)
                                        setDialogOpen(true)
                                      }}
                                    >
                                      <Pencil data-icon="inline-start" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(f)}>
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
                          <TableCell colSpan={5} className="h-40 text-center text-sm text-muted-foreground">
                            Không tìm thấy khoa nào phù hợp.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : resource === "mon-hoc" ? (
                  <Table className="min-w-[850px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[140px]">Mã môn</TableHead>
                        <TableHead className="w-[300px]">Tên môn học</TableHead>
                        <TableHead className="w-[120px]">Tín chỉ</TableHead>
                        <TableHead className="w-[180px]">Điểm CK trung bình</TableHead>
                        <TableHead className="w-[160px]">Trạng thái kết quả</TableHead>
                        <TableHead className="w-[60px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="size-5 animate-spin" />
                              <span>Đang tải danh sách môn học...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : pageContent.length ? (
                        pageContent.map((mh: any) => {
                          const avgCK = courseAverages.get(mh.maMH)
                          const isNoGrade = noGradeCourseCodes.has(mh.maMH)

                          return (
                            <TableRow key={mh.maMH} className="hover:bg-muted/30">
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs font-semibold">
                                  {mh.maMH}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-foreground">{mh.tenMH}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-mono">
                                  {mh.soTinChi} TC
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {avgCK !== undefined ? (
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold ${
                                        avgCK >= 8.0
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                          : avgCK >= 6.5
                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                      }`}
                                    >
                                      {avgCK.toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">điểm TB</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isNoGrade ? (
                                  <Badge
                                    variant="outline"
                                    className="border-amber-300 bg-amber-50 text-[11px] text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                  >
                                    Chưa có điểm
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  >
                                    <CheckCircle2 className="mr-1 size-3" />
                                    Đã đánh giá
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Thao tác với môn ${mh.tenMH}`}
                                      />
                                    }
                                  >
                                    <MoreHorizontal />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRecord(mh)
                                        setDialogOpen(true)
                                      }}
                                    >
                                      <Pencil data-icon="inline-start" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(mh)}>
                                      <Trash2 data-icon="inline-start" />
                                      Xóa môn học
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center text-sm text-muted-foreground">
                            Không tìm thấy môn học nào phù hợp.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : resource === "giang-vien" ? (
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[240px]">Giảng viên</TableHead>
                        <TableHead className="w-[120px]">Mã GV</TableHead>
                        <TableHead className="w-[200px]">Khoa công tác</TableHead>
                        <TableHead className="w-[200px]">Email</TableHead>
                        <TableHead className="w-[130px]">Điện thoại</TableHead>
                        <TableHead className="w-[160px]">Lớp cố vấn</TableHead>
                        <TableHead className="w-[60px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-40 text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="size-5 animate-spin" />
                              <span>Đang tải danh sách giảng viên...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : pageContent.length ? (
                        pageContent.map((gv: any) => {
                          const facultyName = facultyNameByCode.get(gv.maKhoa) || gv.maKhoa
                          const advised = advisedClassesByLecturer.get(gv.maGV) || []

                          return (
                            <TableRow key={gv.maGV} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <InitialAvatar name={gv.hoTen} src={gv.avatarUrl} className="size-9" />
                                  <span className="font-medium text-foreground">{gv.hoTen}</span>
                                </div>

                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs font-semibold">
                                  {gv.maGV}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm font-medium">{facultyName}</TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">
                                <a href={`mailto:${gv.email}`} className="hover:text-primary hover:underline">
                                  {gv.email}
                                </a>
                              </TableCell>
                              <TableCell className="tabular-nums text-xs font-mono">{gv.soDienThoai}</TableCell>
                              <TableCell>
                                {advised.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {advised.map((cls) => (
                                      <Badge key={cls} variant="secondary" className="font-mono text-[11px]">
                                        {cls}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Chưa cố vấn</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Thao tác với giảng viên ${gv.hoTen}`}
                                      />
                                    }
                                  >
                                    <MoreHorizontal />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRecord(gv)
                                        setDialogOpen(true)
                                      }}
                                    >
                                      <Pencil data-icon="inline-start" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(gv)}>
                                      <Trash2 data-icon="inline-start" />
                                      Xóa giảng viên
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-40 text-center text-sm text-muted-foreground">
                            Không tìm thấy giảng viên nào phù hợp.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : resource === "hoc-ky" ? (
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[140px]">Mã học kỳ</TableHead>
                        <TableHead className="w-[260px]">Tên học kỳ</TableHead>
                        <TableHead className="w-[180px]">Năm học</TableHead>
                        <TableHead className="w-[120px]">Kỳ đào tạo</TableHead>
                        <TableHead className="w-[180px]">Số điểm đã chấm</TableHead>
                        <TableHead className="w-[60px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="size-5 animate-spin" />
                              <span>Đang tải danh sách học kỳ...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : pageContent.length ? (
                        pageContent.map((hk: any) => {
                          const count = semesterGradeCounts.get(hk.maHK)

                          return (
                            <TableRow key={hk.maHK} className="hover:bg-muted/30">
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs font-semibold">
                                  {hk.maHK}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-foreground">
                                {hk.tenHocKy || `Học kỳ ${hk.ky} (${hk.namHoc})`}
                              </TableCell>
                              <TableCell className="font-mono text-sm">{hk.namHoc}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">Kỳ {hk.ky}</Badge>
                              </TableCell>
                              <TableCell>
                                {count !== undefined ? (
                                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold">
                                    <Badge variant="outline" className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                      {count} bài đã chấm
                                    </Badge>
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Thao tác với học kỳ ${hk.maHK}`}
                                      />
                                    }
                                  >
                                    <MoreHorizontal />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRecord(hk)
                                        setDialogOpen(true)
                                      }}
                                    >
                                      <Pencil data-icon="inline-start" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(hk)}>
                                      <Trash2 data-icon="inline-start" />
                                      Xóa học kỳ
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center text-sm text-muted-foreground">
                            Không tìm thấy học kỳ nào phù hợp.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : resource === "lop" ? (
                  <Table className="min-w-[750px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="w-[140px]">Mã lớp</TableHead>
                        <TableHead className="w-[280px]">Tên lớp học</TableHead>
                        <TableHead className="w-[140px]">Khóa tuyển sinh</TableHead>
                        <TableHead className="w-[200px]">Khoa phụ trách</TableHead>
                        <TableHead className="w-[200px]">Cố vấn học tập</TableHead>
                        <TableHead className="w-[60px] text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                              <Loader2 className="size-5 animate-spin" />
                              <span>Đang tải danh sách lớp học...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : pageContent.length ? (
                        pageContent.map((item: any) => {
                          const fName = facultyNameByCode.get(item.maKhoa) || item.tenKhoa || item.maKhoa
                          const gvName = lecturerNameByCode.get(item.maGVCoVan) || item.tenGVCoVan || "—"

                          return (
                            <TableRow key={item.maLop} className="hover:bg-muted/30">
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs font-semibold">
                                  {item.maLop}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-foreground">{item.tenLop}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="font-mono">
                                  Khóa {item.khoaHoc}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm font-medium">{fName}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {item.maGVCoVan ? (
                                  <Badge variant="outline" className="gap-1.5 font-normal">
                                    <GraduationCap className="size-3 text-primary" />
                                    <span>{gvName}</span>
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Chưa phân công</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Thao tác với lớp ${item.maLop}`}
                                      />
                                    }
                                  >
                                    <MoreHorizontal />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRecord(item)
                                        setDialogOpen(true)
                                      }}
                                    >
                                      <Pencil data-icon="inline-start" />
                                      Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(item)}>
                                      <Trash2 data-icon="inline-start" />
                                      Xóa lớp
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center text-sm text-muted-foreground">
                            Không tìm thấy lớp học nào phù hợp.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : null}
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
        </TabsContent>
      </Tabs>

      <CatalogFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={resource}
        record={selectedRecord}
        fields={fields}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bản ghi danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang xóa{" "}
              <span className="font-medium text-foreground">
                {deleteTarget ? String(readRecord(deleteTarget, config.primaryKey)) : ""}
              </span>
              . Thao tác này sẽ xóa bản ghi khỏi hệ thống nếu không còn ràng buộc dữ liệu khóa ngoại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Xóa bản ghi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
