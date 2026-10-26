"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  ContactRound,
  Download,
  GraduationCap,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"
import { InitialAvatar, PageHeading, Pagination, RequestBadge } from "@/components/admin-ui"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAcademicData } from "@/components/academic-data-provider"
import { studentService } from "@/services"
import type { GioiTinh, SinhVienRequest, SinhVienResponse } from "@/services/types"
import { getErrorMessage, getSuccessMessage } from "@/lib/api-client"

const pageSize = 6

type StudentFormValues = {
  maSV: string
  hoTen: string
  ngaySinh: string
  gioiTinh: GioiTinh
  diaChi: string
  email: string
  soDienThoai: string
  maLop: string
}

type DialogMode = "full" | "contact"

const emptyStudentForm: StudentFormValues = {
  maSV: "",
  hoTen: "",
  ngaySinh: "2004-01-15",
  gioiTinh: "Nam",
  diaChi: "",
  email: "",
  soDienThoai: "",
  maLop: "",
}

function StudentFormDialog({
  open,
  onOpenChange,
  student,
  mode,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: SinhVienResponse | null
  mode: DialogMode
  onSuccess: () => void
}) {
  const { classes, faculties } = useAcademicData()
  const [values, setValues] = useState<StudentFormValues>(emptyStudentForm)
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormValues, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(
      student
        ? {
            maSV: student.maSV,
            hoTen: student.hoTen,
            ngaySinh: student.ngaySinh,
            gioiTinh: student.gioiTinh,
            diaChi: student.diaChi,
            email: student.email,
            soDienThoai: student.soDienThoai,
            maLop: student.maLop,
          }
        : {
            ...emptyStudentForm,
            maLop: classes[0]?.maLop ?? "",
          }
    )
    setErrors({})
    setSubmitting(false)
  }, [open, student, classes])

  const updateValue = <K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof StudentFormValues, string>> = {}
    const contactOnly = mode === "contact"

    if (!contactOnly && !values.maSV.trim()) nextErrors.maSV = "Vui lòng nhập mã sinh viên."
    if (!contactOnly && !values.hoTen.trim()) nextErrors.hoTen = "Vui lòng nhập họ và tên."
    if (!contactOnly && !values.ngaySinh) nextErrors.ngaySinh = "Vui lòng chọn ngày sinh."
    if (!contactOnly && !values.maLop) nextErrors.maLop = "Vui lòng chọn lớp học."
    if (!values.diaChi.trim()) nextErrors.diaChi = "Vui lòng nhập địa chỉ."
    if (!values.email.trim()) nextErrors.email = "Vui lòng nhập email."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = "Email chưa đúng định dạng."
    if (!values.soDienThoai.trim()) nextErrors.soDienThoai = "Vui lòng nhập số điện thoại."
    else if (!/^0\d{9}$/.test(values.soDienThoai.trim())) nextErrors.soDienThoai = "Số điện thoại cần gồm 10 chữ số và bắt đầu bằng 0."

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      if (mode === "contact" && student) {
        const res = await studentService.updateProfile(student.maSV, {
          diaChi: values.diaChi.trim(),
          soDienThoai: values.soDienThoai.trim(),
          email: values.email.trim(),
        })
        toast.success(getSuccessMessage(res, "Cập nhật thông tin liên hệ thành công."))
      } else if (student) {
        const payload: SinhVienRequest = {
          maSV: values.maSV.trim().toUpperCase(),
          hoTen: values.hoTen.trim(),
          ngaySinh: values.ngaySinh,
          gioiTinh: values.gioiTinh,
          diaChi: values.diaChi.trim(),
          email: values.email.trim(),
          soDienThoai: values.soDienThoai.trim(),
          maLop: values.maLop,
        }
        const res = await studentService.updateStudent(student.maSV, payload)
        toast.success(getSuccessMessage(res, "Cập nhật hồ sơ sinh viên thành công."))
      } else {
        const payload: SinhVienRequest = {
          maSV: values.maSV.trim().toUpperCase(),
          hoTen: values.hoTen.trim(),
          ngaySinh: values.ngaySinh,
          gioiTinh: values.gioiTinh,
          diaChi: values.diaChi.trim(),
          email: values.email.trim(),
          soDienThoai: values.soDienThoai.trim(),
          maLop: values.maLop,
        }
        const res = await studentService.createStudent(payload)
        toast.success(getSuccessMessage(res, "Tạo mới hồ sơ sinh viên thành công."))
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const msg = getErrorMessage(err, "Thao tác thất bại.")
      toast.error(msg)
      if (mode === "full" && !student) {
        setErrors((current) => ({ ...current, maSV: msg }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isContactOnly = mode === "contact"
  const title = isContactOnly ? "Cập nhật thông tin liên hệ" : student ? "Chỉnh sửa hồ sơ sinh viên" : "Thêm sinh viên mới"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4 sm:px-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isContactOnly
              ? "Cập nhật thông tin liên hệ (SĐT, Email, Địa chỉ) - Ứng với Câu 11."
              : "Thông tin hồ sơ sinh viên được kiểm tra và lưu trực tiếp vào cơ sở dữ liệu."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 sm:px-6">
          {!isContactOnly ? (
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.maSV)}>
                <FieldLabel htmlFor="student-code">Mã sinh viên</FieldLabel>
                <Input
                  id="student-code"
                  value={values.maSV}
                  onChange={(event) => updateValue("maSV", event.target.value.toUpperCase())}
                  placeholder="Ví dụ: B24DCCE001"
                  disabled={Boolean(student) || submitting}
                  aria-invalid={Boolean(errors.maSV)}
                />
                <FieldError>{errors.maSV}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.hoTen)}>
                <FieldLabel htmlFor="student-name">Họ và tên</FieldLabel>
                <Input
                  id="student-name"
                  value={values.hoTen}
                  onChange={(event) => updateValue("hoTen", event.target.value)}
                  placeholder="Nguyễn Hoàng Nam"
                  disabled={submitting}
                  aria-invalid={Boolean(errors.hoTen)}
                />
                <FieldError>{errors.hoTen}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.ngaySinh)}>
                <FieldLabel htmlFor="student-birth">Ngày sinh</FieldLabel>
                <Input
                  id="student-birth"
                  type="date"
                  value={values.ngaySinh}
                  onChange={(event) => updateValue("ngaySinh", event.target.value)}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.ngaySinh)}
                />
                <FieldError>{errors.ngaySinh}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="student-gender">Giới tính</FieldLabel>
                <Select
                  value={values.gioiTinh}
                  onValueChange={(value) => updateValue("gioiTinh", (value ?? "Nam") as StudentFormValues["gioiTinh"])}
                  disabled={submitting}
                >
                  <SelectTrigger id="student-gender" className="w-full">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field data-invalid={Boolean(errors.maLop)} className="sm:col-span-2">
                <FieldLabel htmlFor="student-class">Lớp học</FieldLabel>
                <Select
                  value={values.maLop}
                  onValueChange={(value) => updateValue("maLop", value ?? "")}
                  disabled={submitting}
                >
                  <SelectTrigger id="student-class" className="w-full" aria-invalid={Boolean(errors.maLop)}>
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {classes.map((academicClass) => {
                        const faculty = faculties.find((item) => item.maKhoa === academicClass.maKhoa)
                        return (
                          <SelectItem key={academicClass.maLop} value={academicClass.maLop}>
                            {academicClass.maLop} · {academicClass.tenLop}
                            {faculty ? ` — ${faculty.tenKhoa}` : ""}
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.maLop}</FieldError>
              </Field>
            </FieldGroup>
          ) : null}

          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="student-email">Email</FieldLabel>
              <Input
                id="student-email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                placeholder="nam.nh@qlsv.edu.vn"
                disabled={submitting}
                aria-invalid={Boolean(errors.email)}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.soDienThoai)}>
              <FieldLabel htmlFor="student-phone">Số điện thoại</FieldLabel>
              <Input
                id="student-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={values.soDienThoai}
                onChange={(event) => updateValue("soDienThoai", event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0981234567"
                disabled={submitting}
                aria-invalid={Boolean(errors.soDienThoai)}
              />
              <FieldError>{errors.soDienThoai}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.diaChi)} className="sm:col-span-2">
              <FieldLabel htmlFor="student-address">Địa chỉ</FieldLabel>
              <Input
                id="student-address"
                value={values.diaChi}
                onChange={(event) => updateValue("diaChi", event.target.value)}
                placeholder="Hà Nội"
                disabled={submitting}
                aria-invalid={Boolean(errors.diaChi)}
              />
              <FieldError>{errors.diaChi}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter className="-mx-5 -mb-5 border-t px-5 py-4 sm:-mx-6 sm:-mb-5 sm:px-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {student ? "Lưu thay đổi" : "Thêm sinh viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function StudentsView() {
  const router = useRouter()
  const { classes, faculties, setActiveTranscriptStudentId, refreshStudents } = useAcademicData()
  const [keyword, setKeyword] = useState("")
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [students, setStudents] = useState<SinhVienResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("full")
  const [selectedStudent, setSelectedStudent] = useState<SinhVienResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SinhVienResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  const facultyNames = useMemo(() => new Map(faculties.map((f) => [f.maKhoa, f.tenKhoa])), [faculties])
  const classNames = useMemo(() => new Map(classes.map((c) => [c.maLop, c.tenLop])), [classes])

  const availableClasses = useMemo(
    () => (facultyFilter === "all" ? classes : classes.filter((c) => c.maKhoa === facultyFilter)),
    [classes, facultyFilter]
  )

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentService.getStudents({
        keyword: keyword.trim() || undefined,
        maLop: classFilter === "all" ? undefined : classFilter,
        maKhoa: facultyFilter === "all" ? undefined : facultyFilter,
        page: Math.max(0, page - 1),
        size: pageSize,
        sort: "maSV,ASC",
      })

      if (res) {
        setStudents(res.content || [])
        setTotalElements(res.totalElements ?? 0)
        setTotalPages(res.totalPages ?? 0)
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải danh sách sinh viên"))
    } finally {
      setLoading(false)
    }
  }, [keyword, classFilter, facultyFilter, page])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const openStudentDialog = (student: SinhVienResponse | null, mode: DialogMode) => {
    setSelectedStudent(student)
    setDialogMode(mode)
    setDialogOpen(true)
  }

  const handleFormSuccess = () => {
    fetchStudents()
    refreshStudents()
  }

  const removeStudent = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await studentService.deleteStudent(deleteTarget.maSV)
      toast.success(getSuccessMessage(res, "Đã xóa hồ sơ và các kết quả học tập liên quan."))
      setDeleteTarget(null)
      fetchStudents()
      refreshStudents()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa hồ sơ sinh viên"))
    } finally {
      setDeleting(false)
    }
  }

  const resetFilters = () => {
    setKeyword("")
    setFacultyFilter("all")
    setClassFilter("all")
    setPage(1)
    toast.success("Bộ lọc đã được làm mới.")
  }

  const exportCsv = async () => {
    try {
      const allRes = await studentService.getStudents({
        keyword: keyword.trim() || undefined,
        maLop: classFilter === "all" ? undefined : classFilter,
        maKhoa: facultyFilter === "all" ? undefined : facultyFilter,
        page: 0,
        size: 1000,
        sort: "maSV,ASC",
      })
      const exportList = allRes?.content || students
      const headers = ["Mã sinh viên", "Họ và tên", "Giới tính", "Ngày sinh", "Lớp", "Khoa", "Email", "Số điện thoại", "Địa chỉ"]
      const rows = exportList.map((student) => [
        student.maSV,
        student.hoTen,
        student.gioiTinh,
        student.ngaySinh,
        student.maLop,
        student.tenKhoa || facultyNames.get(classes.find((c) => c.maLop === student.maLop)?.maKhoa ?? "") || "",
        student.email,
        student.soDienThoai,
        student.diaChi,
      ])
      const csvCell = (value: string) => {
        const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
        return `"${String(safe).replace(/"/g, '""')}"`
      }
      const csv = [headers, ...rows].map((row) => row.map((cell) => csvCell(String(cell))).join(",")).join("\r\n")
      const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "danh-sach-sinh-vien.csv"
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success(`Đã xuất ${exportList.length} hồ sơ sinh viên.`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Xuất CSV thất bại"))
    }
  }

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Đào tạo · Hồ sơ"
        title="Quản lý sinh viên"
        description="Tìm kiếm, lọc theo khoa và lớp; cập nhật hồ sơ học tập kết nối trực tiếp với Spring Boot Backend."
        actions={
          <>
            <RequestBadge>GET /api/v1/sinh-vien</RequestBadge>
            <Button type="button" variant="outline" onClick={exportCsv} disabled={totalElements === 0 || loading}>
              <Download data-icon="inline-start" />
              Xuất CSV
            </Button>
            <Button type="button" onClick={() => openStudentDialog(null, "full")}>
              <Plus data-icon="inline-start" />
              Thêm sinh viên
            </Button>
          </>
        }
      />

      <section aria-label="Tóm tắt sinh viên" className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UsersRound aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">
                {loading ? "..." : totalElements.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-muted-foreground">Tổng hồ sơ phù hợp</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
              <GraduationCap aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">{faculties.length}</p>
              <p className="text-xs text-muted-foreground">Khoa đào tạo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ContactRound aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl font-semibold tabular-nums">{classes.length}</p>
              <p className="text-xs text-muted-foreground">Lớp học vận hành</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <label htmlFor="student-search" className="sr-only">
                Tìm theo mã sinh viên hoặc họ tên
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="student-search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value)
                  setPage(1)
                }}
                placeholder="Tìm theo mã sinh viên hoặc họ tên..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="sr-only" htmlFor="student-faculty-filter">
                Lọc theo khoa
              </label>
              <Select
                value={facultyFilter}
                onValueChange={(value) => {
                  setFacultyFilter(value ?? "all")
                  setClassFilter("all")
                  setPage(1)
                }}
              >
                <SelectTrigger id="student-faculty-filter" className="w-full sm:w-[190px]">
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

              <label className="sr-only" htmlFor="student-class-filter">
                Lọc theo lớp
              </label>
              <Select
                value={classFilter}
                onValueChange={(value) => {
                  setClassFilter(value ?? "all")
                  setPage(1)
                }}
              >
                <SelectTrigger id="student-class-filter" className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Tất cả lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Tất cả lớp</SelectItem>
                    {availableClasses.map((academicClass) => (
                      <SelectItem key={academicClass.maLop} value={academicClass.maLop}>
                        {academicClass.maLop}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button type="button" variant="ghost" size="sm" className="justify-start" onClick={resetFilters}>
                <RotateCcw data-icon="inline-start" />
                Làm mới
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1180px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[215px]">Sinh viên</TableHead>
                  <TableHead className="w-[125px]">Mã SV</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead className="w-[205px]">Email</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead className="w-[160px]">Địa chỉ</TableHead>
                  <TableHead className="w-[58px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-44 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                        <span>Đang tải danh sách sinh viên...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : students.length ? (
                  students.map((student) => {
                    const studentClass = classes.find((c) => c.maLop === student.maLop)
                    const facultyName =
                      student.tenKhoa ||
                      (student.maKhoa ? facultyNames.get(student.maKhoa) : null) ||
                      facultyNames.get(studentClass?.maKhoa ?? "") ||
                      "—"

                    return (
                      <TableRow key={student.maSV}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-2.5">
                            <InitialAvatar name={student.hoTen} className="size-9" />
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{student.hoTen}</span>
                              <span className="block truncate text-xs text-muted-foreground">Hồ sơ học vụ</span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[11px]">
                            {student.maSV}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {student.gioiTinh}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {student.ngaySinh
                            ? new Date(`${student.ngaySinh}T00:00:00`).toLocaleDateString("vi-VN")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <span className="block font-medium">{student.maLop}</span>
                          <span className="block max-w-[150px] truncate text-xs text-muted-foreground">
                            {student.tenLop || classNames.get(student.maLop) || "Chưa gán lớp"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-[150px] truncate">{facultyName}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.maKhoa || studentClass?.maKhoa || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-[190px] truncate" title={student.email}>
                            {student.email}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums">{student.soDienThoai}</TableCell>
                        <TableCell>
                          <span className="block max-w-[145px] truncate" title={student.diaChi}>
                            {student.diaChi}
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
                                  aria-label={`Thao tác với ${student.hoTen}`}
                                />
                              }
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem onClick={() => openStudentDialog(student, "full")}>
                                <Pencil data-icon="inline-start" />
                                Chỉnh sửa hồ sơ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openStudentDialog(student, "contact")}>
                                <ContactRound data-icon="inline-start" />
                                Cập nhật liên hệ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setActiveTranscriptStudentId(student.maSV)
                                  router.push("/diem")
                                }}
                              >
                                <GraduationCap data-icon="inline-start" />
                                Xem bảng điểm cá nhân
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(student)}>
                                <Trash2 data-icon="inline-start" />
                                Xóa sinh viên
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-44 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <Search aria-hidden="true" />
                        <p className="font-medium text-foreground">Không tìm thấy sinh viên</p>
                        <p className="text-sm">Thử thay đổi từ khóa hoặc bộ lọc khoa, lớp.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination
            pageNo={page}
            pageSize={pageSize}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={selectedStudent}
        mode={dialogMode}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hồ sơ sinh viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Hồ sơ{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.hoTen} ({deleteTarget?.maSV})
              </span>{" "}
              cùng toàn bộ các bản ghi điểm liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={removeStudent} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Xóa sinh viên
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
