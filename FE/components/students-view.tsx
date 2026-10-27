"use client"

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  BookOpen,
  Building2,
  Calendar,
  ContactRound,
  Download,
  Eye,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
  UsersRound,
  X,
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
import { useAcademicData } from "@/components/academic-data-provider"
import { studentService } from "@/services"
import type { GioiTinh, SinhVienRequest, SinhVienResponse } from "@/services/types"
import { getErrorMessage, getSuccessMessage } from "@/lib/api-client"

const pageSize = 8

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
        toast.success(getSuccessMessage(res, "Thêm sinh viên mới thành công."))
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast.error(getErrorMessage(err, "Thao tác thất bại"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4 sm:px-6">
          <DialogTitle>
            {mode === "contact"
              ? "Cập nhật thông tin liên hệ"
              : student
                ? "Chỉnh sửa hồ sơ sinh viên"
                : "Thêm sinh viên mới"}
          </DialogTitle>
          <DialogDescription>
            {mode === "contact"
              ? "Cập nhật địa chỉ, email và số điện thoại liên lạc của sinh viên."
              : "Hồ sơ học vụ được lưu đồng bộ trực tiếp vào cơ sở dữ liệu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 px-5 py-5 sm:px-6">
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {mode === "full" ? (
              <>
                <Field data-invalid={Boolean(errors.maSV)}>
                  <FieldLabel htmlFor="student-id">Mã sinh viên</FieldLabel>
                  <Input
                    id="student-id"
                    value={values.maSV}
                    onChange={(event) => updateValue("maSV", event.target.value.toUpperCase())}
                    placeholder="B20DCCN001"
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
                    placeholder="Nguyễn Văn An"
                    disabled={submitting}
                    aria-invalid={Boolean(errors.hoTen)}
                  />
                  <FieldError>{errors.hoTen}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.ngaySinh)}>
                  <FieldLabel htmlFor="student-dob">Ngày sinh</FieldLabel>
                  <Input
                    id="student-dob"
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
                    onValueChange={(value) => updateValue("gioiTinh", (value as GioiTinh) ?? "Nam")}
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
                  <FieldLabel htmlFor="student-class">Lớp học phụ trách</FieldLabel>
                  <Select
                    value={values.maLop}
                    onValueChange={(value) => updateValue("maLop", value ?? "")}
                    disabled={submitting}
                  >
                    <SelectTrigger id="student-class" className="w-full" aria-invalid={Boolean(errors.maLop)}>
                      <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {classes.map((c) => {
                          const faculty = faculties.find((f) => f.maKhoa === c.maKhoa)
                          return (
                            <SelectItem key={c.maLop} value={c.maLop}>
                              {c.maLop} · {c.tenLop} {faculty ? `(${faculty.tenKhoa})` : ""}
                            </SelectItem>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors.maLop}</FieldError>
                </Field>
              </>
            ) : null}

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="student-email">Email</FieldLabel>
              <Input
                id="student-email"
                type="email"
                value={values.email}
                onChange={(event) => updateValue("email", event.target.value)}
                placeholder="sinhvien@qlsv.edu.vn"
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
                value={values.soDienThoai}
                onChange={(event) => updateValue("soDienThoai", event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0981234567"
                disabled={submitting}
                aria-invalid={Boolean(errors.soDienThoai)}
              />
              <FieldError>{errors.soDienThoai}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.diaChi)} className="sm:col-span-2">
              <FieldLabel htmlFor="student-address">Địa chỉ thường trú</FieldLabel>
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

function StudentDetailDialog({
  open,
  onOpenChange,
  student,
  onEditFull,
  onEditContact,
  onViewGrades,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: SinhVienResponse | null
  onEditFull: () => void
  onEditContact: () => void
  onViewGrades: () => void
}) {
  const { classes, faculties, lecturers } = useAcademicData()

  if (!student) return null

  const studentClass = classes.find((c) => c.maLop === student.maLop)
  const faculty = faculties.find((f) => f.maKhoa === (student.maKhoa || studentClass?.maKhoa))
  const advisor = lecturers.find((l) => l.maGV === studentClass?.maGVCoVan)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-muted/20 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <InitialAvatar name={student.hoTen} className="size-14 text-lg font-bold shadow-sm" />
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold">{student.hoTen}</DialogTitle>
                  <Badge
                    variant="outline"
                    className={
                      student.gioiTinh === "Nam"
                        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                        : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                    }
                  >
                    {student.gioiTinh}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs font-semibold">
                    {student.maSV}
                  </Badge>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs font-medium text-foreground">{student.maLop}</span>
                  {faculty ? (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{faculty.tenKhoa}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 p-5 sm:p-6">
          {/* Thông tin học vụ */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <GraduationCap className="size-4 text-primary" />
              Thông tin học vụ
            </h4>
            <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Lớp học</p>
                <p className="mt-0.5 text-sm font-medium">
                  {student.maLop} {studentClass?.tenLop ? `(${studentClass.tenLop})` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Khoa phụ trách</p>
                <p className="mt-0.5 text-sm font-medium">
                  {faculty?.tenKhoa || student.tenKhoa || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Khóa tuyển sinh</p>
                <p className="mt-0.5 text-sm font-medium">
                  {studentClass?.khoaHoc ? `Khóa ${studentClass.khoaHoc}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cố vấn học tập</p>
                <p className="mt-0.5 text-sm font-medium">
                  {advisor ? `${advisor.hoTen} (${advisor.maGV})` : "Chưa phân công"}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin cá nhân & liên hệ */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ContactRound className="size-4 text-sky-600 dark:text-sky-400" />
              Thông tin cá nhân & liên hệ
            </h4>
            <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2">
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Ngày sinh</p>
                  <p className="text-sm font-medium tabular-nums">
                    {student.ngaySinh
                      ? new Date(`${student.ngaySinh}T00:00:00`).toLocaleDateString("vi-VN")
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <a
                    href={`tel:${student.soDienThoai}`}
                    className="text-sm font-medium tabular-nums text-primary hover:underline"
                  >
                    {student.soDienThoai || "—"}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:col-span-2">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email nhà trường</p>
                  <a
                    href={`mailto:${student.email}`}
                    className="block truncate text-sm font-medium text-primary hover:underline"
                  >
                    {student.email || "—"}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:col-span-2">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Địa chỉ thường trú</p>
                  <p className="text-sm font-medium">{student.diaChi || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 border-t bg-muted/10 px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
          <Button
            type="button"
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => {
              onOpenChange(false)
              onViewGrades()
            }}
          >
            <GraduationCap data-icon="inline-start" />
            Xem bảng điểm sinh viên
          </Button>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEditContact()
              }}
            >
              <ContactRound data-icon="inline-start" />
              Đổi liên hệ
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEditFull()
              }}
            >
              <Pencil data-icon="inline-start" />
              Sửa hồ sơ
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

function StudentsViewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { classes, faculties, setActiveTranscriptStudentId, refreshStudents } = useAcademicData()

  const urlMaLop = searchParams?.get("maLop")
  const urlMaKhoa = searchParams?.get("maKhoa")
  const urlKeyword = searchParams?.get("keyword")

  const [keyword, setKeyword] = useState(urlKeyword || "")
  const [facultyFilter, setFacultyFilter] = useState(urlMaKhoa || "all")
  const [classFilter, setClassFilter] = useState(urlMaLop || "all")
  const [page, setPage] = useState(1)

  const [students, setStudents] = useState<SinhVienResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("full")
  const [selectedStudent, setSelectedStudent] = useState<SinhVienResponse | null>(null)
  const [detailStudent, setDetailStudent] = useState<SinhVienResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SinhVienResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Sync if URL search params change
  useEffect(() => {
    if (urlMaLop) setClassFilter(urlMaLop)
    if (urlMaKhoa) setFacultyFilter(urlMaKhoa)
    if (urlKeyword) setKeyword(urlKeyword)
  }, [urlMaLop, urlMaKhoa, urlKeyword])

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
    router.replace("/sinh-vien")
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

  const hasActiveFilters = classFilter !== "all" || facultyFilter !== "all" || Boolean(keyword.trim())

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Đào tạo · Quản lý hồ sơ"
        title="Quản lý sinh viên"
        description="Tìm kiếm, phân loại theo khoa - lớp, xem bảng điểm và cập nhật thông tin học vụ theo thời gian thực."
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
                placeholder="Tìm theo mã SV hoặc họ tên..."
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
                        {academicClass.maLop} ({academicClass.tenLop})
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

          {/* Active Filter Chips Bar */}
          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Bộ lọc đang áp dụng:</span>
              {classFilter !== "all" ? (
                <Badge variant="secondary" className="gap-1.5 py-0.5 font-normal">
                  Lớp: <span className="font-semibold text-foreground">{classFilter}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setClassFilter("all")
                      setPage(1)
                    }}
                    className="ml-0.5 rounded-full hover:bg-muted hover:text-foreground"
                    aria-label="Bỏ lọc lớp"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ) : null}
              {facultyFilter !== "all" ? (
                <Badge variant="secondary" className="gap-1.5 py-0.5 font-normal">
                  Khoa: <span className="font-semibold text-foreground">{facultyNames.get(facultyFilter) || facultyFilter}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFacultyFilter("all")
                      setPage(1)
                    }}
                    className="ml-0.5 rounded-full hover:bg-muted hover:text-foreground"
                    aria-label="Bỏ lọc khoa"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ) : null}
              {keyword ? (
                <Badge variant="secondary" className="gap-1.5 py-0.5 font-normal">
                  Từ khóa: &quot;<span className="font-semibold text-foreground">{keyword}</span>&quot;
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword("")
                      setPage(1)
                    }}
                    className="ml-0.5 rounded-full hover:bg-muted hover:text-foreground"
                    aria-label="Bỏ lọc từ khóa"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                onClick={resetFilters}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[230px]">Sinh viên</TableHead>
                  <TableHead className="w-[125px]">Mã SV</TableHead>
                  <TableHead className="w-[90px]">Giới tính</TableHead>
                  <TableHead className="w-[110px]">Ngày sinh</TableHead>
                  <TableHead className="w-[180px]">Lớp học</TableHead>
                  <TableHead className="w-[180px]">Khoa</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[120px]">Điện thoại</TableHead>
                  <TableHead className="w-[140px]">Địa chỉ</TableHead>
                  <TableHead className="w-[60px] text-right">Thao tác</TableHead>
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
                      <TableRow
                        key={student.maSV}
                        className="group transition-colors hover:bg-muted/40"
                      >
                        <TableCell>
                          <button
                            type="button"
                            className="flex min-w-0 items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-0.5"
                            onClick={() => setDetailStudent(student)}
                            title="Xem chi tiết hồ sơ"
                          >
                            <InitialAvatar name={student.hoTen} className="size-9 shrink-0 transition-transform group-hover:scale-105" />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-foreground hover:text-primary group-hover:underline">
                                {student.hoTen}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                Chi tiết hồ sơ →
                              </span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[11px] font-semibold">
                            {student.maSV}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              student.gioiTinh === "Nam"
                                ? "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
                                : "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                            }
                          >
                            {student.gioiTinh}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular-nums text-xs">
                          {student.ngaySinh
                            ? new Date(`${student.ngaySinh}T00:00:00`).toLocaleDateString("vi-VN")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <span className="block font-medium text-foreground">{student.maLop}</span>
                          <span className="block max-w-[160px] truncate text-xs text-muted-foreground">
                            {student.tenLop || classNames.get(student.maLop) || "Chưa gán lớp"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-[160px] truncate font-medium text-foreground">{facultyName}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.maKhoa || studentClass?.maKhoa || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-[185px] truncate text-xs font-mono" title={student.email}>
                            {student.email}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums text-xs font-mono">{student.soDienThoai}</TableCell>
                        <TableCell>
                          <span className="block max-w-[130px] truncate text-xs" title={student.diaChi}>
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
                              <DropdownMenuItem onClick={() => setDetailStudent(student)}>
                                <Eye data-icon="inline-start" />
                                Xem chi tiết hồ sơ
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
                              <DropdownMenuItem onClick={() => openStudentDialog(student, "full")}>
                                <Pencil data-icon="inline-start" />
                                Chỉnh sửa hồ sơ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openStudentDialog(student, "contact")}>
                                <ContactRound data-icon="inline-start" />
                                Cập nhật liên hệ
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
                        <Search className="size-8 text-muted-foreground/60" aria-hidden="true" />
                        <p className="font-semibold text-foreground">Không tìm thấy sinh viên</p>
                        <p className="text-xs">
                          Thử thay đổi từ khóa tìm kiếm hoặc bấm &quot;Làm mới&quot; để xóa bộ lọc.
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={resetFilters} className="mt-2">
                          Đặt lại bộ lọc
                        </Button>
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

      <StudentDetailDialog
        open={Boolean(detailStudent)}
        onOpenChange={(open) => {
          if (!open) setDetailStudent(null)
        }}
        student={detailStudent}
        onEditFull={() => openStudentDialog(detailStudent, "full")}
        onEditContact={() => openStudentDialog(detailStudent, "contact")}
        onViewGrades={() => {
          if (detailStudent) {
            setActiveTranscriptStudentId(detailStudent.maSV)
            router.push("/diem")
          }
        }}
      />

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

export function StudentsView() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <StudentsViewContent />
    </Suspense>
  )
}
