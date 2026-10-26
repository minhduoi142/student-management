"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import {
  Award,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  Medal,
  MoreHorizontal,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useAcademicData } from "@/components/academic-data-provider"
import { InitialAvatar, PageHeading, RequestBadge } from "@/components/admin-ui"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { gradeService, statService } from "@/services"
import type {
  BangDiemSinhVienResponse,
  DashboardOverviewResponse,
  KetQuaRequest,
  KetQuaResponse,
} from "@/services/types"
import { getErrorMessage, getSuccessMessage } from "@/lib/api-client"

function calculateFinalGrade(diemCC: number, diemGK: number, diemCK: number) {
  return Number((diemCC * 0.1 + diemGK * 0.3 + diemCK * 0.6).toFixed(2))
}

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 8 ? "default" : score >= 4 ? "secondary" : "destructive"
  return <Badge variant={variant} className="min-w-12 justify-center tabular-nums">{score.toFixed(2)}</Badge>
}

function GradeEntryPanel({ onGradeSaved }: { onGradeSaved?: () => void }) {
  const { students, courses, semesters } = useAcademicData()
  const [form, setForm] = useState({
    maSV: "",
    maMH: "",
    maHK: "",
    diemCC: "",
    diemGK: "",
    diemCK: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Auto initialize form fields when catalogs load
  useEffect(() => {
    setForm((current) => ({
      maSV: current.maSV || students[0]?.maSV || "",
      maMH: current.maMH || courses[0]?.maMH || "",
      maHK: current.maHK || semesters[0]?.maHK || "",
      diemCC: current.diemCC,
      diemGK: current.diemGK,
      diemCK: current.diemCK,
    }))
  }, [students, courses, semesters])

  const updateCombination = (key: "maSV" | "maMH" | "maHK", value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
  }

  const scores = [form.diemCC, form.diemGK, form.diemCK].map((value) =>
    value.trim() === "" ? Number.NaN : Number(value)
  )
  const areScoresValid = scores.every((score) => Number.isFinite(score) && score >= 0 && score <= 10)
  const previewTotal = areScoresValid ? calculateFinalGrade(scores[0], scores[1], scores[2]) : null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.maSV) nextErrors.maSV = "Vui lòng chọn sinh viên."
    if (!form.maMH) nextErrors.maMH = "Vui lòng chọn môn học."
    if (!form.maHK) nextErrors.maHK = "Vui lòng chọn học kỳ."
    ;(["diemCC", "diemGK", "diemCK"] as const).forEach((key, index) => {
      if (!Number.isFinite(scores[index])) nextErrors[key] = "Vui lòng nhập điểm từ 0 đến 10."
      else if (scores[index] < 0 || scores[index] > 10) nextErrors[key] = "Điểm phải nằm trong khoảng 0–10."
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const payload: KetQuaRequest = {
        maSV: form.maSV,
        maMH: form.maMH,
        maHK: form.maHK,
        diemCC: scores[0],
        diemGK: scores[1],
        diemCK: scores[2],
      }
      const res = await gradeService.saveOrUpdate(payload)
      toast.success(getSuccessMessage(res, "Lưu kết quả điểm thành công"))
      onGradeSaved?.()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lưu kết quả điểm"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Nhập điểm học phần</CardTitle>
              <CardDescription className="mt-1">
                Chọn sinh viên, môn học và học kỳ để thêm hoặc cập nhật kết quả.
              </CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
              POST /api/v1/diem
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.maSV)}>
                <FieldLabel htmlFor="grade-student">Sinh viên</FieldLabel>
                <Select value={form.maSV} onValueChange={(value) => updateCombination("maSV", value ?? "")} disabled={submitting}>
                  <SelectTrigger id="grade-student" className="w-full" aria-invalid={Boolean(errors.maSV)}>
                    <SelectValue placeholder="Chọn sinh viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {students.map((student) => (
                        <SelectItem key={student.maSV} value={student.maSV}>
                          {student.maSV} · {student.hoTen}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.maSV}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.maMH)}>
                <FieldLabel htmlFor="grade-course">Môn học</FieldLabel>
                <Select value={form.maMH} onValueChange={(value) => updateCombination("maMH", value ?? "")} disabled={submitting}>
                  <SelectTrigger id="grade-course" className="w-full" aria-invalid={Boolean(errors.maMH)}>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {courses.map((course) => (
                        <SelectItem key={course.maMH} value={course.maMH}>
                          {course.maMH} · {course.tenMH} ({course.soTinChi} TC)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.maMH}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.maHK)} className="sm:col-span-2">
                <FieldLabel htmlFor="grade-semester">Học kỳ</FieldLabel>
                <Select value={form.maHK} onValueChange={(value) => updateCombination("maHK", value ?? "")} disabled={submitting}>
                  <SelectTrigger id="grade-semester" className="w-full" aria-invalid={Boolean(errors.maHK)}>
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {semesters.map((semester) => (
                        <SelectItem key={semester.maHK} value={semester.maHK}>
                          {semester.tenHocKy || `Học kỳ ${semester.ky} - ${semester.namHoc}`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.maHK}</FieldError>
              </Field>
            </FieldGroup>

            <div className="rounded-xl border bg-muted/25 p-4">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Thành phần điểm</p>
                  <p className="mt-1 text-xs text-muted-foreground">Chuyên cần 10% · Giữa kỳ 30% · Cuối kỳ 60%</p>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">Tự động tính: CC*0.1 + GK*0.3 + CK*0.6</Badge>
              </div>
              <FieldGroup className="grid gap-3 sm:grid-cols-3">
                {([
                  ["diemCC", "Chuyên cần", "Hệ số 0.1"],
                  ["diemGK", "Giữa kỳ", "Hệ số 0.3"],
                  ["diemCK", "Cuối kỳ", "Hệ số 0.6"],
                ] as const).map(([key, label, description]) => (
                  <Field key={key} data-invalid={Boolean(errors[key])}>
                    <FieldLabel htmlFor={`grade-${key}`}>{label}</FieldLabel>
                    <Input
                      id={`grade-${key}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="10"
                      step="0.01"
                      value={form[key]}
                      disabled={submitting}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, [key]: event.target.value }))
                        setErrors((current) => ({ ...current, [key]: "" }))
                      }}
                      placeholder="0.00"
                      aria-invalid={Boolean(errors[key])}
                    />
                    <FieldDescription>{description}</FieldDescription>
                    <FieldError>{errors[key]}</FieldError>
                  </Field>
                ))}
              </FieldGroup>
            </div>

            <div className="flex flex-col gap-4 rounded-xl bg-primary/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calculator aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Điểm tổng kết dự kiến</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {previewTotal === null ? "—" : previewTotal.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">/ 10</span>
                  </p>
                </div>
              </div>
              <Button type="submit" className="sm:min-w-40" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save data-icon="inline-start" />}
                Lưu điểm
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <FileSpreadsheet aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-base">Quy tắc tính điểm</CardTitle>
                <CardDescription className="mt-1">Tổng kết tự động theo trọng số</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Chuyên cần</span>
              <span className="font-medium">10%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Giữa kỳ</span>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Cuối kỳ</span>
              <span className="font-medium">60%</span>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-3 text-center font-mono text-xs text-muted-foreground">
              CC × 0.1 + GK × 0.3 + CK × 0.6
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />
              Kiểm tra nghiệp vụ Backend
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary" />
              API tự động kiểm tra sự tồn tại của Sinh viên, Môn học, Học kỳ (HTTP 404).
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary" />
              Điểm thành phần phải nằm trong khoảng từ 0.00 đến 10.00 (HTTP 400).
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary" />
              Nếu bản ghi đã tồn tại cho bộ ba (MaSV, MaMH, MaHK), hệ thống tự động cập nhật kết quả.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TranscriptPanel({ onGradeDeleted }: { onGradeDeleted?: () => void }) {
  const { students, semesters, activeTranscriptStudentId, setActiveTranscriptStudentId } = useAcademicData()
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [transcript, setTranscript] = useState<BangDiemSinhVienResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<KetQuaResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  const selectedStudentId =
    activeTranscriptStudentId && students.some((s) => s.maSV === activeTranscriptStudentId)
      ? activeTranscriptStudentId
      : students[0]?.maSV ?? ""

  const fetchTranscript = useCallback(async () => {
    if (!selectedStudentId) return
    setLoading(true)
    try {
      const res = await gradeService.getBangDiem(
        selectedStudentId,
        semesterFilter === "all" ? undefined : semesterFilter
      )
      setTranscript(res)
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải bảng điểm sinh viên"))
      setTranscript(null)
    } finally {
      setLoading(false)
    }
  }, [selectedStudentId, semesterFilter])

  useEffect(() => {
    fetchTranscript()
  }, [fetchTranscript])

  const studentGrades = transcript?.danhSachDiem || []
  const totalCredits = studentGrades.reduce((sum, g) => sum + (g.soTinChi ?? 0), 0)

  const handleDeleteGrade = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await gradeService.delete(deleteTarget.maSV, deleteTarget.maMH, deleteTarget.maHK)
      toast.success(getSuccessMessage(res, "Xóa bản ghi điểm thành công."))
      setDeleteTarget(null)
      fetchTranscript()
      onGradeDeleted?.()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa bản ghi điểm"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            {transcript ? <InitialAvatar name={transcript.hoTen} className="size-12" /> : null}
            <div className="min-w-0">
              <p className="truncate font-semibold">{transcript?.hoTen ?? "Chưa có sinh viên"}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {transcript?.maSV ?? selectedStudentId} · {transcript?.tenLop ?? "—"} · {transcript?.tenKhoa ?? "—"}
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:w-[340px] sm:grid-cols-2">
            <label className="sr-only" htmlFor="transcript-student">
              Chọn sinh viên
            </label>
            <Select
              value={selectedStudentId}
              onValueChange={(value) => setActiveTranscriptStudentId(value ?? null)}
            >
              <SelectTrigger id="transcript-student" className="w-full">
                <SelectValue placeholder="Chọn sinh viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {students.map((item) => (
                    <SelectItem key={item.maSV} value={item.maSV}>
                      {item.maSV} · {item.hoTen}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <label className="sr-only" htmlFor="transcript-semester">
              Lọc học kỳ
            </label>
            <Select value={semesterFilter} onValueChange={(value) => setSemesterFilter(value ?? "all")}>
              <SelectTrigger id="transcript-semester" className="w-full">
                <SelectValue placeholder="Tất cả học kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả học kỳ</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.maHK} value={semester.maHK}>
                      {semester.tenHocKy || `Học kỳ ${semester.ky}`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <section aria-label="Tổng hợp bảng điểm" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard icon={BookOpenCheck} label="Môn đã có điểm" value={studentGrades.length.toLocaleString("vi-VN")} />
        <SummaryCard
          icon={GraduationCap}
          label="Tín chỉ tích lũy"
          value={(transcript?.tongTinChiTichLuy ?? 0).toLocaleString("vi-VN")}
        />
        <SummaryCard
          icon={Calculator}
          label="Điểm TB tích lũy (Hệ 10)"
          value={transcript?.diemTrungBinhTichLuy !== undefined ? transcript.diemTrungBinhTichLuy.toFixed(2) : "—"}
        />
        <SummaryCard icon={Award} label="Tổng tín chỉ đăng ký" value={totalCredits.toLocaleString("vi-VN")} />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Bảng điểm cá nhân</CardTitle>
            <CardDescription className="mt-1">
              Kết quả học tập theo môn và học kỳ (Câu 4, 5)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <RequestBadge>GET /api/v1/diem/sinh-vien/{selectedStudentId || "{maSV}"}</RequestBadge>
            <Button type="button" variant="ghost" size="sm" onClick={fetchTranscript} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} data-icon="inline-start" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Môn học</TableHead>
                  <TableHead>Học kỳ</TableHead>
                  <TableHead className="text-center">CC (10%)</TableHead>
                  <TableHead className="text-center">GK (30%)</TableHead>
                  <TableHead className="text-center">CK (60%)</TableHead>
                  <TableHead className="text-center">Tổng kết</TableHead>
                  <TableHead className="text-center">Đánh giá</TableHead>
                  <TableHead className="w-[58px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                        <span>Đang tải bảng điểm...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : studentGrades.length ? (
                  studentGrades.map((grade) => (
                    <TableRow key={`${grade.maSV}-${grade.maMH}-${grade.maHK}`}>
                      <TableCell>
                        <span className="block font-medium">{grade.tenMH || grade.maMH}</span>
                        <span className="text-xs text-muted-foreground">
                          {grade.maMH} · {grade.soTinChi ?? 0} tín chỉ
                        </span>
                      </TableCell>
                      <TableCell>{grade.tenHocKy || grade.maHK}</TableCell>
                      <TableCell className="text-center tabular-nums">
                        {grade.diemCC !== undefined ? Number(grade.diemCC).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {grade.diemGK !== undefined ? Number(grade.diemGK).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {grade.diemCK !== undefined ? Number(grade.diemCK).toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreBadge score={Number(grade.diemTongKet ?? 0)} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={grade.danhGia === "Đạt" || Number(grade.diemTongKet) >= 4 ? "secondary" : "destructive"}>
                          {grade.danhGia || (Number(grade.diemTongKet) >= 4 ? "Đạt" : "Trượt")}
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(grade)}>
                              <Trash2 data-icon="inline-start" />
                              Xóa bản ghi điểm
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-sm text-muted-foreground">
                      Chưa có kết quả điểm trong học kỳ đã chọn.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bản ghi điểm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa điểm môn{" "}
              <span className="font-medium text-foreground">{deleteTarget?.tenMH || deleteTarget?.maMH}</span> của sinh viên{" "}
              <span className="font-medium text-foreground">{deleteTarget?.maSV}</span> ở học kỳ{" "}
              <span className="font-medium text-foreground">{deleteTarget?.maHK}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteGrade} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Xóa điểm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CourseReportPanel({ onGradeDeleted }: { onGradeDeleted?: () => void }) {
  const { courses, semesters } = useAcademicData()
  const [courseFilter, setCourseFilter] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [threshold, setThreshold] = useState("8.0")
  const [reportRows, setReportRows] = useState<KetQuaResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<KetQuaResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Initialize courseFilter
  useEffect(() => {
    if (!courseFilter && courses[0]?.maMH) {
      setCourseFilter(courses[0].maMH)
    }
  }, [courses, courseFilter])

  const thresholdValue = Number(threshold) || 8.0

  const fetchCourseGrades = useCallback(async () => {
    if (!courseFilter || courseFilter === "all") return
    setLoading(true)
    try {
      const data = await gradeService.getByMonHoc(
        courseFilter,
        semesterFilter === "all" ? undefined : semesterFilter
      )
      setReportRows(data || [])
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải danh sách điểm theo môn học"))
      setReportRows([])
    } finally {
      setLoading(false)
    }
  }, [courseFilter, semesterFilter])

  useEffect(() => {
    fetchCourseGrades()
  }, [fetchCourseGrades])

  const sortedRows = useMemo(
    () => [...reportRows].sort((a, b) => Number(b.diemTongKet) - Number(a.diemTongKet)),
    [reportRows]
  )

  const qualifiedCount = sortedRows.filter(
    (g) => Number(g.diemCK) >= thresholdValue || Number(g.diemTongKet) >= thresholdValue
  ).length

  const handleDeleteGrade = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await gradeService.delete(deleteTarget.maSV, deleteTarget.maMH, deleteTarget.maHK)
      toast.success(getSuccessMessage(res, "Xóa bản ghi điểm thành công."))
      setDeleteTarget(null)
      fetchCourseGrades()
      onGradeDeleted?.()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa bản ghi điểm"))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(190px,0.7fr)_minmax(170px,0.6fr)_auto] md:items-end">
          <Field>
            <FieldLabel htmlFor="course-report-course">Môn học</FieldLabel>
            <Select value={courseFilter} onValueChange={(value) => setCourseFilter(value ?? "")}>
              <SelectTrigger id="course-report-course" className="w-full">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {courses.map((course) => (
                    <SelectItem key={course.maMH} value={course.maMH}>
                      {course.maMH} · {course.tenMH}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="course-report-semester">Học kỳ</FieldLabel>
            <Select value={semesterFilter} onValueChange={(value) => setSemesterFilter(value ?? "all")}>
              <SelectTrigger id="course-report-semester" className="w-full">
                <SelectValue placeholder="Tất cả học kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả học kỳ</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.maHK} value={semester.maHK}>
                      {semester.tenHocKy || `Học kỳ ${semester.ky}`}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="course-report-threshold">Ngưỡng tuyên dương (CK / TK)</FieldLabel>
            <Input
              id="course-report-threshold"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            />
          </Field>
          <div className="flex h-10 items-center gap-2 rounded-xl border bg-muted/25 px-3 text-sm">
            <Medal className="text-primary" aria-hidden="true" />
            <span>
              <strong className="tabular-nums">{qualifiedCount}</strong>
              <span className="ml-1 text-muted-foreground">đạt ngưỡng</span>
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Kết quả theo môn học</CardTitle>
            <CardDescription className="mt-1">
              Xem danh sách điểm sinh viên theo môn học và nhận diện sinh viên đạt điểm cao (Câu 8).
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <RequestBadge>GET /api/v1/diem/mon-hoc/{courseFilter || "{maMH}"}</RequestBadge>
            <Button type="button" variant="ghost" size="sm" onClick={fetchCourseGrades} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} data-icon="inline-start" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Học kỳ</TableHead>
                  <TableHead className="text-center">Chuyên cần</TableHead>
                  <TableHead className="text-center">Giữa kỳ</TableHead>
                  <TableHead className="text-center">Cuối kỳ</TableHead>
                  <TableHead className="text-center">Tổng kết</TableHead>
                  <TableHead className="text-center">Ghi nhận</TableHead>
                  <TableHead className="w-[58px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-36 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                        <span>Đang tải kết quả theo môn...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedRows.length ? (
                  sortedRows.map((grade) => {
                    const isHonors =
                      Number(grade.diemCK) >= thresholdValue || Number(grade.diemTongKet) >= thresholdValue
                    return (
                      <TableRow key={`${grade.maSV}-${grade.maMH}-${grade.maHK}`}>
                        <TableCell>
                          <span className="block font-medium">{grade.hoTenSV || grade.maSV}</span>
                          <span className="text-xs text-muted-foreground">{grade.maSV}</span>
                        </TableCell>
                        <TableCell>{grade.maLop || "—"}</TableCell>
                        <TableCell>{grade.tenHocKy || grade.maHK}</TableCell>
                        <TableCell className="text-center tabular-nums">
                          {grade.diemCC !== undefined ? Number(grade.diemCC).toFixed(2) : "—"}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {grade.diemGK !== undefined ? Number(grade.diemGK).toFixed(2) : "—"}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {grade.diemCK !== undefined ? Number(grade.diemCK).toFixed(2) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <ScoreBadge score={Number(grade.diemTongKet ?? 0)} />
                        </TableCell>
                        <TableCell className="text-center">
                          {isHonors ? (
                            <Badge>
                              <Award data-icon="inline-start" />
                              Tuyên dương
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button type="button" variant="ghost" size="icon" aria-label="Thao tác" />}
                            >
                              <MoreHorizontal />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(grade)}>
                                <Trash2 data-icon="inline-start" />
                                Xóa bản ghi điểm
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-36 text-center text-sm text-muted-foreground">
                      Không có bản ghi phù hợp với bộ lọc môn học này.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
            <Search aria-hidden="true" />
            Đang hiển thị {sortedRows.length} kết quả · {qualifiedCount} sinh viên đạt từ{" "}
            {thresholdValue.toFixed(1)} điểm
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bản ghi điểm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa điểm môn{" "}
              <span className="font-medium text-foreground">{deleteTarget?.tenMH || deleteTarget?.maMH}</span> của sinh viên{" "}
              <span className="font-medium text-foreground">{deleteTarget?.maSV}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteGrade} disabled={deleting}>
              {deleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Xóa điểm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold tabular-nums">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function GradesView() {
  const { students } = useAcademicData()
  const [activeTab, setActiveTab] = useState("entry")
  const [dashboardStats, setDashboardStats] = useState<DashboardOverviewResponse | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true)
      const res = await statService.getDashboard()
      setDashboardStats(res)
    } catch (err) {
      console.error("Lỗi khi tải thống kê điểm:", err)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Đào tạo · Kết quả học tập"
        title="Quản lý điểm học phần"
        description="Nhập và chỉnh sửa điểm thành phần, tra cứu bảng điểm cá nhân và lọc kết quả theo môn học."
        actions={<RequestBadge>RESTful API: /api/v1/diem</RequestBadge>}
      />
      <section aria-label="Tóm tắt kết quả điểm" className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          icon={FileSpreadsheet}
          label="Bản ghi điểm"
          value={loadingStats ? "..." : (dashboardStats?.tongSoBanGhiDiem ?? 0).toLocaleString("vi-VN")}
        />
        <SummaryCard
          icon={Calculator}
          label="Tổng môn học"
          value={loadingStats ? "..." : (dashboardStats?.tongSoMonHoc ?? 0).toLocaleString("vi-VN")}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Tổng học kỳ"
          value={loadingStats ? "..." : (dashboardStats?.tongSoHocKy ?? 0).toLocaleString("vi-VN")}
        />
        <SummaryCard
          icon={UsersRound}
          label="Tổng sinh viên"
          value={loadingStats ? "..." : (dashboardStats?.tongSoSinhVien ?? students.length).toLocaleString("vi-VN")}
        />
      </section>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value ?? "entry")}>
        <TabsList className="mb-4 grid h-auto w-full grid-cols-3 rounded-xl p-1 sm:w-fit">
          <TabsTrigger value="entry" className="gap-2 px-3 py-2">
            <FileSpreadsheet />
            Nhập điểm
          </TabsTrigger>
          <TabsTrigger value="transcript" className="gap-2 px-3 py-2">
            <GraduationCap />
            Bảng điểm cá nhân
          </TabsTrigger>
          <TabsTrigger value="course" className="gap-2 px-3 py-2">
            <BookOpenCheck />
            Theo môn học
          </TabsTrigger>
        </TabsList>
        <TabsContent value="entry">
          <GradeEntryPanel onGradeSaved={fetchStats} />
        </TabsContent>
        <TabsContent value="transcript">
          <TranscriptPanel onGradeDeleted={fetchStats} />
        </TabsContent>
        <TabsContent value="course">
          <CourseReportPanel onGradeDeleted={fetchStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
