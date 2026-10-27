"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import {
  AlertTriangle,
  Award,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  Medal,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { gradeService, statService } from "@/services"
import type {
  BangDiemSinhVienResponse,
  DashboardOverviewResponse,
  DiemTrungBinhMonResponse,
  KetQuaRequest,
  KetQuaResponse,
  SinhVienDiemGioiResponse,
  SinhVienResponse,
} from "@/services/types"
import { getErrorMessage, getSuccessMessage } from "@/lib/api-client"

function calculateFinalGrade(diemCC: number, diemGK: number, diemCK: number) {
  return Number((diemCC * 0.1 + diemGK * 0.3 + diemCK * 0.6).toFixed(2))
}

function getGradeClassification(score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (score >= 9.0) return { label: "Xuất sắc", variant: "default" }
  if (score >= 8.0) return { label: "Giỏi", variant: "default" }
  if (score >= 6.5) return { label: "Khá", variant: "secondary" }
  if (score >= 5.0) return { label: "Trung bình", variant: "secondary" }
  if (score >= 4.0) return { label: "Đạt", variant: "outline" }
  return { label: "Học lại", variant: "destructive" }
}

function ScoreBadge({ score }: { score: number }) {
  const { variant } = getGradeClassification(score)
  return (
    <Badge variant={variant} className="min-w-12 justify-center font-mono font-semibold tabular-nums">
      {score.toFixed(2)}
    </Badge>
  )
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3.5 p-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          {sub ? <p className="truncate text-[10px] text-muted-foreground">{sub}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function GradesView() {
  const { students, courses, semesters, activeTranscriptStudentId, setActiveTranscriptStudentId } = useAcademicData()
  const [activeTab, setActiveTab] = useState<"book" | "transcript" | "analytics">("book")

  // Overview Stats
  const [dashboardStats, setDashboardStats] = useState<DashboardOverviewResponse | null>(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  // Tab 1: Grade Book State
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [searchStudent, setSearchStudent] = useState<string>("")
  const [filterScoreTier, setFilterScoreTier] = useState<string>("all") // all, high, pass, fail
  const [courseGrades, setCourseGrades] = useState<KetQuaResponse[]>([])
  const [loadingGrades, setLoadingGrades] = useState(false)

  // Tab 2: Individual Transcript State
  const [transcriptStudentId, setTranscriptStudentId] = useState<string>("")
  const [transcriptSemester, setTranscriptSemester] = useState<string>("all")
  const [transcript, setTranscript] = useState<BangDiemSinhVienResponse | null>(null)
  const [loadingTranscript, setLoadingTranscript] = useState(false)

  // Tab 3: Analytics State
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"honors" | "nograde" | "courseavg">("honors")
  const [honorStudents, setHonorStudents] = useState<SinhVienDiemGioiResponse[]>([])
  const [noGradeStudents, setNoGradeStudents] = useState<SinhVienResponse[]>([])
  const [courseAverages, setCourseAverages] = useState<DiemTrungBinhMonResponse[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [honorCourse, setHonorCourse] = useState<string>("")
  const [honorMinScore, setHonorMinScore] = useState<string>("8.0")

  // Modal Dialog: Add / Edit Grade
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState({
    maSV: "",
    maMH: "",
    maHK: "",
    diemCC: "",
    diemGK: "",
    diemCK: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submittingGrade, setSubmittingGrade] = useState(false)

  // Delete Grade State
  const [deleteTarget, setDeleteTarget] = useState<KetQuaResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Set initial selected course & student
  useEffect(() => {
    if (!selectedCourse && courses[0]?.maMH) {
      setSelectedCourse(courses[0].maMH)
    }
    if (!honorCourse && courses[0]?.maMH) {
      setHonorCourse(courses[0].maMH)
    }
  }, [courses, selectedCourse, honorCourse])

  useEffect(() => {
    if (activeTranscriptStudentId) {
      setTranscriptStudentId(activeTranscriptStudentId)
      setActiveTab("transcript")
    } else if (!transcriptStudentId && students[0]?.maSV) {
      setTranscriptStudentId(students[0].maSV)
    }
  }, [activeTranscriptStudentId, students, transcriptStudentId])

  // Fetch Dashboard Stats
  const fetchOverviewStats = useCallback(async () => {
    try {
      setLoadingOverview(true)
      const res = await statService.getDashboard()
      setDashboardStats(res)
    } catch {
      // ignore
    } finally {
      setLoadingOverview(false)
    }
  }, [])

  useEffect(() => {
    fetchOverviewStats()
  }, [fetchOverviewStats])

  // Fetch Tab 1: Grade Book for selected course & semester
  const fetchCourseGrades = useCallback(async () => {
    if (!selectedCourse) return
    setLoadingGrades(true)
    try {
      const data = await gradeService.getByMonHoc(
        selectedCourse,
        selectedSemester === "all" ? undefined : selectedSemester
      )
      setCourseGrades(data || [])
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải danh sách điểm theo môn."))
      setCourseGrades([])
    } finally {
      setLoadingGrades(false)
    }
  }, [selectedCourse, selectedSemester])

  useEffect(() => {
    if (activeTab === "book") {
      fetchCourseGrades()
    }
  }, [activeTab, fetchCourseGrades])

  // Fetch Tab 2: Transcript
  const fetchTranscript = useCallback(async () => {
    if (!transcriptStudentId) return
    setLoadingTranscript(true)
    try {
      const data = await gradeService.getBangDiem(
        transcriptStudentId,
        transcriptSemester === "all" ? undefined : transcriptSemester
      )
      setTranscript(data)
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải bảng điểm sinh viên."))
      setTranscript(null)
    } finally {
      setLoadingTranscript(false)
    }
  }, [transcriptStudentId, transcriptSemester])

  useEffect(() => {
    if (activeTab === "transcript") {
      fetchTranscript()
    }
  }, [activeTab, fetchTranscript])

  // Fetch Tab 3: Analytics
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true)
    try {
      if (analyticsSubTab === "honors" && honorCourse) {
        const res = await statService.getSinhVienDiemCao(honorCourse, Number(honorMinScore) || 8.0)
        setHonorStudents(res || [])
      } else if (analyticsSubTab === "nograde") {
        const res = await statService.getSinhVienChuaCoDiem()
        setNoGradeStudents(res || [])
      } else if (analyticsSubTab === "courseavg") {
        const res = await statService.getDiemTrungBinhMon()
        setCourseAverages(res || [])
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể tải báo cáo thống kê."))
    } finally {
      setLoadingAnalytics(false)
    }
  }, [analyticsSubTab, honorCourse, honorMinScore])

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics()
    }
  }, [activeTab, fetchAnalytics])

  // Filtered Grade Book rows
  const filteredBookRows = useMemo(() => {
    const q = searchStudent.trim().toLowerCase()
    return courseGrades.filter((g) => {
      const name = g.hoTenSV || ""
      const code = g.maSV || ""
      const matchesSearch = !q || name.toLowerCase().includes(q) || code.toLowerCase().includes(q)

      const finalScore = Number(g.diemTongKet ?? 0)
      let matchesTier = true
      if (filterScoreTier === "high") matchesTier = finalScore >= 8.0
      else if (filterScoreTier === "pass") matchesTier = finalScore >= 4.0
      else if (filterScoreTier === "fail") matchesTier = finalScore < 4.0

      return matchesSearch && matchesTier
    })
  }, [courseGrades, searchStudent, filterScoreTier])

  // Calculate quick metrics for current course
  const currentCourseStats = useMemo(() => {
    if (!courseGrades.length) return null
    const total = courseGrades.length
    const passed = courseGrades.filter((g) => Number(g.diemTongKet ?? 0) >= 4.0).length
    const sumFinal = courseGrades.reduce((sum, g) => sum + Number(g.diemTongKet ?? 0), 0)
    const avg = Number((sumFinal / total).toFixed(2))
    const honors = courseGrades.filter((g) => Number(g.diemTongKet ?? 0) >= 8.0).length
    return { total, passed, avg, honors, passRate: Math.round((passed / total) * 100) }
  }, [courseGrades])

  // Open Grade Dialog (New or Edit)
  const openGradeDialog = (initial?: Partial<KetQuaResponse>) => {
    setFormValues({
      maSV: initial?.maSV || transcriptStudentId || students[0]?.maSV || "",
      maMH: initial?.maMH || selectedCourse || courses[0]?.maMH || "",
      maHK: initial?.maHK || semesters[0]?.maHK || "",
      diemCC: initial?.diemCC !== undefined ? String(initial.diemCC) : "",
      diemGK: initial?.diemGK !== undefined ? String(initial.diemGK) : "",
      diemCK: initial?.diemCK !== undefined ? String(initial.diemCK) : "",
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  // Live preview for dialog
  const scores = [formValues.diemCC, formValues.diemGK, formValues.diemCK].map((v) =>
    v.trim() === "" ? Number.NaN : Number(v)
  )
  const areScoresValid = scores.every((s) => Number.isFinite(s) && s >= 0 && s <= 10)
  const previewTotal = areScoresValid ? calculateFinalGrade(scores[0], scores[1], scores[2]) : null

  const handleSaveGrade = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!formValues.maSV) errs.maSV = "Vui lòng chọn sinh viên."
    if (!formValues.maMH) errs.maMH = "Vui lòng chọn môn học."
    if (!formValues.maHK) errs.maHK = "Vui lòng chọn học kỳ."
    ;(["diemCC", "diemGK", "diemCK"] as const).forEach((key, idx) => {
      if (!Number.isFinite(scores[idx])) errs[key] = "Nhập điểm từ 0.00 đến 10.00."
      else if (scores[idx] < 0 || scores[idx] > 10) errs[key] = "Điểm phải nằm trong khoảng 0–10."
    })
    setFormErrors(errs)
    if (Object.keys(errs).length) return

    setSubmittingGrade(true)
    try {
      const payload: KetQuaRequest = {
        maSV: formValues.maSV,
        maMH: formValues.maMH,
        maHK: formValues.maHK,
        diemCC: scores[0],
        diemGK: scores[1],
        diemCK: scores[2],
      }
      const res = await gradeService.saveOrUpdate(payload)
      toast.success(getSuccessMessage(res, "Lưu kết quả điểm thành công."))
      setDialogOpen(false)
      fetchCourseGrades()
      fetchTranscript()
      fetchOverviewStats()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lưu điểm học phần."))
    } finally {
      setSubmittingGrade(false)
    }
  }

  const handleDeleteGrade = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await gradeService.delete(deleteTarget.maSV, deleteTarget.maMH, deleteTarget.maHK)
      toast.success(getSuccessMessage(res, "Xóa bản ghi điểm thành công."))
      setDeleteTarget(null)
      fetchCourseGrades()
      fetchTranscript()
      fetchOverviewStats()
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể xóa bản ghi điểm."))
    } finally {
      setDeleting(false)
    }
  }

  const jumpToTranscript = (studentId: string) => {
    setActiveTranscriptStudentId(studentId)
    setTranscriptStudentId(studentId)
    setActiveTab("transcript")
  }

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Đào tạo · Kết quả học tập"
        title="Quản lý điểm học phần"
        description="Theo dõi và nhập điểm thi, tra cứu kết quả cá nhân, đánh giá sinh viên đạt điểm cao và phân tích học vụ."
        actions={
          <>
            <RequestBadge>REST API: /api/v1/diem</RequestBadge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                fetchOverviewStats()
                if (activeTab === "book") fetchCourseGrades()
                if (activeTab === "transcript") fetchTranscript()
                if (activeTab === "analytics") fetchAnalytics()
                toast.success("Đã làm mới dữ liệu điểm.")
              }}
            >
              <RefreshCw className="size-4" data-icon="inline-start" />
              Làm mới
            </Button>
            <Button type="button" onClick={() => openGradeDialog()}>
              <Plus data-icon="inline-start" />
              Nhập điểm học phần
            </Button>
          </>
        }
      />

      {/* Top Overview KPI Cards */}
      <section aria-label="Tổng quan điểm" className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={FileSpreadsheet}
          label="Tổng bản ghi điểm"
          value={loadingOverview ? "..." : (dashboardStats?.tongSoBanGhiDiem ?? 0).toLocaleString("vi-VN")}
          sub="Toàn bộ kết quả đã nhập"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Tỷ lệ đạt môn học"
          value={currentCourseStats ? `${currentCourseStats.passRate}%` : "—"}
          sub={currentCourseStats ? `${currentCourseStats.passed}/${currentCourseStats.total} lượt đạt` : "Theo môn đang chọn"}
        />
        <SummaryCard
          icon={Calculator}
          label="Điểm TB môn hiện tại"
          value={currentCourseStats ? currentCourseStats.avg.toFixed(2) : "—"}
          sub="Thang điểm 10"
        />
        <SummaryCard
          icon={UsersRound}
          label="Sinh viên đã có điểm"
          value={loadingOverview ? "..." : (dashboardStats?.tongSoSinhVien ?? students.length).toLocaleString("vi-VN")}
          sub="Hồ sơ liên kết kết quả"
        />
      </section>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <TabsList className="mb-4 grid h-auto w-full grid-cols-3 rounded-xl p-1 sm:w-fit">
          <TabsTrigger value="book" className="gap-2 px-4 py-2.5">
            <FileSpreadsheet className="size-4" />
            Bảng điểm môn & lớp
          </TabsTrigger>
          <TabsTrigger value="transcript" className="gap-2 px-4 py-2.5">
            <GraduationCap className="size-4" />
            Bảng điểm sinh viên
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 px-4 py-2.5">
            <Medal className="size-4" />
            Thống kê & Danh hiệu
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
            TAB 1: BẢNG ĐIỂM THEO MÔN & LỚP (GRADE BOOK)
           ========================================================================= */}
        <TabsContent value="book" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg">Danh sách điểm theo môn học</CardTitle>
                  <CardDescription>
                    Lọc theo môn và học kỳ để kiểm tra, cập nhật điểm CC (10%), GK (30%), CK (60%).
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {courseGrades.length} sinh viên đã học
                  </Badge>
                  {currentCourseStats ? (
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <Sparkles className="size-3 text-amber-500" />
                      {currentCourseStats.honors} sinh viên giỏi (≥ 8.0)
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Filters */}
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Tìm tên hoặc MSSV..."
                    className="pl-9"
                  />
                </div>

                {/* Course Select */}
                <div>
                  <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn môn học">
                        {courses.find((c) => c.maMH === selectedCourse)?.tenMH
                          ? `${selectedCourse} · ${courses.find((c) => c.maMH === selectedCourse)?.tenMH}`
                          : selectedCourse || "Chọn môn học"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {courses.map((c) => (
                          <SelectItem key={c.maMH} value={c.maMH}>
                            {c.maMH} · {c.tenMH} ({c.soTinChi} TC)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Semester Select */}
                <div>
                  <Select value={selectedSemester} onValueChange={(val) => setSelectedSemester(val ?? "all")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả học kỳ">
                        {selectedSemester === "all"
                          ? "Tất cả học kỳ"
                          : semesters.find((s) => s.maHK === selectedSemester)?.tenHocKy ||
                            `Học kỳ ${selectedSemester}`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Tất cả học kỳ</SelectItem>
                        {semesters.map((s) => (
                          <SelectItem key={s.maHK} value={s.maHK}>
                            {s.tenHocKy || `Học kỳ ${s.ky} (${s.namHoc})`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Score Tier Select */}
                <div>
                  <Select value={filterScoreTier} onValueChange={(val) => setFilterScoreTier(val ?? "all")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả mức điểm">
                        {filterScoreTier === "all"
                          ? "Tất cả mức điểm"
                          : filterScoreTier === "high"
                            ? "Điểm cao (≥ 8.0)"
                            : filterScoreTier === "pass"
                              ? "Đạt (≥ 4.0)"
                              : "Học lại (< 4.0)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Tất cả mức điểm</SelectItem>
                        <SelectItem value="high">Điểm cao (≥ 8.0)</SelectItem>
                        <SelectItem value="pass">Đạt (≥ 4.0)</SelectItem>
                        <SelectItem value="fail">Học lại (&lt; 4.0)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[950px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[230px]">Sinh viên</TableHead>
                      <TableHead className="w-[130px]">Lớp</TableHead>
                      <TableHead className="w-[140px]">Học kỳ</TableHead>
                      <TableHead className="w-[100px] text-center">CC (10%)</TableHead>
                      <TableHead className="w-[100px] text-center">GK (30%)</TableHead>
                      <TableHead className="w-[100px] text-center">CK (60%)</TableHead>
                      <TableHead className="w-[120px] text-center">Tổng kết</TableHead>
                      <TableHead className="w-[120px] text-center">Xếp loại</TableHead>
                      <TableHead className="w-[70px] text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingGrades ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-44 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="size-5 animate-spin" />
                            <span>Đang tải bảng điểm học phần...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredBookRows.length ? (
                      filteredBookRows.map((grade) => {
                        const finalVal = Number(grade.diemTongKet ?? 0)
                        const classification = getGradeClassification(finalVal)

                        return (
                          <TableRow key={`${grade.maSV}-${grade.maMH}-${grade.maHK}`} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <InitialAvatar name={grade.hoTenSV || grade.maSV} className="size-8" />
                                <div>
                                  <p className="font-medium text-foreground">{grade.hoTenSV || grade.maSV}</p>
                                  <p className="font-mono text-xs text-muted-foreground">{grade.maSV}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {grade.maLop || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {grade.tenHocKy || grade.maHK}
                            </TableCell>
                            <TableCell className="text-center font-mono tabular-nums">
                              {grade.diemCC !== undefined ? Number(grade.diemCC).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-center font-mono tabular-nums">
                              {grade.diemGK !== undefined ? Number(grade.diemGK).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-center font-mono tabular-nums">
                              {grade.diemCK !== undefined ? Number(grade.diemCK).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              <ScoreBadge score={finalVal} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={classification.variant}>{classification.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Thao tác với điểm của ${grade.maSV}`}
                                    />
                                  }
                                >
                                  <MoreHorizontal className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuItem onClick={() => openGradeDialog(grade)}>
                                    <Pencil data-icon="inline-start" />
                                    Chỉnh sửa điểm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => jumpToTranscript(grade.maSV)}>
                                    <GraduationCap data-icon="inline-start" />
                                    Xem bảng điểm cá nhân
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
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
                        <TableCell colSpan={9} className="h-44 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                            <BookOpenCheck className="size-8 opacity-40" />
                            <p className="font-medium text-foreground">Chưa có bản ghi điểm</p>
                            <p className="text-xs">
                              Chưa có sinh viên nào có điểm môn này trong kỳ đã chọn. Nhấn &quot;Nhập điểm học phần&quot; để thêm mới.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => openGradeDialog()}
                            >
                              <Plus className="mr-1 size-3.5" /> Nhập điểm ngay
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bottom Summary Bar */}
              {currentCourseStats ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      Hiển thị <strong>{filteredBookRows.length}</strong> / <strong>{courseGrades.length}</strong> kết quả
                    </span>
                    <span>
                      Điểm TB môn: <strong className="text-foreground">{currentCourseStats.avg.toFixed(2)}</strong>
                    </span>
                    <span>
                      Tỷ lệ đạt: <strong className="text-foreground">{currentCourseStats.passRate}%</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-emerald-500" /> Đạt: {currentCourseStats.passed}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="size-2 rounded-full bg-destructive" /> Học lại: {currentCourseStats.total - currentCourseStats.passed}
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================================================
            TAB 2: BẢNG ĐIỂM CÁ NHÂN (STUDENT TRANSCRIPT)
           ========================================================================= */}
        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-center gap-3.5">
                {transcript ? (
                  <InitialAvatar name={transcript.hoTen} className="size-14 text-base" />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <GraduationCap className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-foreground">
                      {transcript?.hoTen ?? "Chưa chọn sinh viên"}
                    </h3>
                    {transcript?.maSV ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {transcript.maSV}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {transcript?.tenLop || transcript?.maLop || "Lớp: —"} · {transcript?.tenKhoa || "Khoa: —"}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:w-[380px] sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="student-picker">
                    Chọn sinh viên
                  </label>
                  <Select
                    value={transcriptStudentId}
                    onValueChange={(val) => {
                      setTranscriptStudentId(val ?? "")
                      setActiveTranscriptStudentId(val ?? "")
                    }}
                  >
                    <SelectTrigger id="student-picker" className="w-full">
                      <SelectValue placeholder="Chọn sinh viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {students.map((s) => (
                          <SelectItem key={s.maSV} value={s.maSV}>
                            {s.maSV} · {s.hoTen}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="transcript-semester-picker">
                    Lọc học kỳ
                  </label>
                  <Select value={transcriptSemester} onValueChange={(val) => setTranscriptSemester(val ?? "all")}>
                    <SelectTrigger id="transcript-semester-picker" className="w-full">
                      <SelectValue placeholder="Toàn khóa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Toàn khóa (Tất cả)</SelectItem>
                        {semesters.map((s) => (
                          <SelectItem key={s.maHK} value={s.maHK}>
                            {s.tenHocKy || `Kỳ ${s.ky} (${s.namHoc})`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student KPI Cards */}
          <section aria-label="Chỉ số cá nhân" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard
              icon={BookOpenCheck}
              label="Môn đã học"
              value={loadingTranscript ? "..." : String(transcript?.danhSachDiem?.length ?? 0)}
              sub="Số môn đã có điểm"
            />
            <SummaryCard
              icon={GraduationCap}
              label="Tín chỉ tích lũy"
              value={loadingTranscript ? "..." : String(transcript?.tongTinChiTichLuy ?? 0)}
              sub="Các môn đạt (≥ 4.0)"
            />
            <SummaryCard
              icon={Calculator}
              label="Điểm TB tích lũy (GPA)"
              value={
                loadingTranscript
                  ? "..."
                  : transcript?.diemTrungBinhTichLuy !== undefined
                  ? transcript.diemTrungBinhTichLuy.toFixed(2)
                  : "—"
              }
              sub="Thang điểm 10 trọng số TC"
            />
            <SummaryCard
              icon={Award}
              label="Xếp loại học lực"
              value={
                transcript?.diemTrungBinhTichLuy !== undefined
                  ? getGradeClassification(transcript.diemTrungBinhTichLuy).label
                  : "—"
              }
              sub="Dựa trên GPA toàn khóa"
            />
          </section>

          {/* Transcript Table */}
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-start justify-between gap-3 border-b bg-muted/20 pb-4">
              <div>
                <CardTitle className="text-base">Bảng điểm chi tiết</CardTitle>
                <CardDescription>
                  Tra cứu chi tiết kết quả từng học phần và học kỳ (Câu 4, 5).
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openGradeDialog({ maSV: transcriptStudentId })}
              >
                <Plus className="mr-1 size-3.5" /> Nhập điểm cho sinh viên này
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[850px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Môn học</TableHead>
                      <TableHead className="w-[100px] text-center">Tín chỉ</TableHead>
                      <TableHead className="w-[150px]">Học kỳ</TableHead>
                      <TableHead className="w-[90px] text-center">CC (10%)</TableHead>
                      <TableHead className="w-[90px] text-center">GK (30%)</TableHead>
                      <TableHead className="w-[90px] text-center">CK (60%)</TableHead>
                      <TableHead className="w-[110px] text-center">Điểm tổng kết</TableHead>
                      <TableHead className="w-[110px] text-center">Đánh giá</TableHead>
                      <TableHead className="w-[70px] text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingTranscript ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-40 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="size-5 animate-spin" />
                            <span>Đang tải bảng điểm cá nhân...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : transcript?.danhSachDiem?.length ? (
                      transcript.danhSachDiem.map((g) => {
                        const finalScore = Number(g.diemTongKet ?? 0)
                        const isPass = finalScore >= 4.0

                        return (
                          <TableRow key={`${g.maSV}-${g.maMH}-${g.maHK}`}>
                            <TableCell>
                              <p className="font-medium text-foreground">{g.tenMH || g.maMH}</p>
                              <p className="font-mono text-xs text-muted-foreground">{g.maMH}</p>
                            </TableCell>
                            <TableCell className="text-center font-medium">{g.soTinChi ?? 3}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{g.tenHocKy || g.maHK}</TableCell>
                            <TableCell className="text-center font-mono tabular-nums">
                              {g.diemCC !== undefined ? Number(g.diemCC).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-center font-mono tabular-nums">
                              {g.diemGK !== undefined ? Number(g.diemGK).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-center font-mono tabular-nums">
                              {g.diemCK !== undefined ? Number(g.diemCK).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              <ScoreBadge score={finalScore} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={isPass ? "secondary" : "destructive"}>
                                {isPass ? "Đạt" : "Học lại"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Thao tác" />
                                  }
                                >
                                  <MoreHorizontal className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openGradeDialog(g)}>
                                    <Pencil data-icon="inline-start" />
                                    Chỉnh sửa điểm
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(g)}>
                                    <Trash2 data-icon="inline-start" />
                                    Xóa điểm
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
                          Sinh viên này chưa có kết quả điểm trong kỳ đã chọn.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================================================
            TAB 3: THỐNG KÊ & BÁO CÁO NGHIỆP VỤ (ANALYTICS)
           ========================================================================= */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={analyticsSubTab === "honors" ? "default" : "outline"}
              size="sm"
              onClick={() => setAnalyticsSubTab("honors")}
            >
              <Medal className="mr-1.5 size-4" />
              Sinh viên điểm cao (Câu 8)
            </Button>
            <Button
              type="button"
              variant={analyticsSubTab === "nograde" ? "default" : "outline"}
              size="sm"
              onClick={() => setAnalyticsSubTab("nograde")}
            >
              <AlertTriangle className="mr-1.5 size-4" />
              Sinh viên chưa có điểm (Câu 9)
            </Button>
            <Button
              type="button"
              variant={analyticsSubTab === "courseavg" ? "default" : "outline"}
              size="sm"
              onClick={() => setAnalyticsSubTab("courseavg")}
            >
              <Calculator className="mr-1.5 size-4" />
              Điểm trung bình theo môn (Câu 7)
            </Button>
          </div>

          {/* Sub-tab 1: Honors (Câu 8) */}
          {analyticsSubTab === "honors" ? (
            <Card>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Sinh viên đạt điểm thi cuối kỳ cao (Câu 8)
                    </CardTitle>
                    <CardDescription>
                      Lọc các sinh viên có điểm thi cuối kỳ đạt từ ngưỡng chỉ định trở lên theo từng môn.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={honorCourse} onValueChange={(val) => setHonorCourse(val ?? "")}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Chọn môn học">
                          {courses.find((c) => c.maMH === honorCourse)?.tenMH
                            ? `${honorCourse} · ${courses.find((c) => c.maMH === honorCourse)?.tenMH}`
                            : honorCourse || "Chọn môn học"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {courses.map((c) => (
                            <SelectItem key={c.maMH} value={c.maMH}>
                              {c.maMH} · {c.tenMH}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Ngưỡng CK ≥</span>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={honorMinScore}
                        onChange={(e) => setHonorMinScore(e.target.value)}
                        className="w-20 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Sinh viên</TableHead>
                      <TableHead>Lớp</TableHead>
                      <TableHead>Môn học</TableHead>
                      <TableHead className="text-center">Điểm cuối kỳ (CK)</TableHead>
                      <TableHead className="text-center">Điểm tổng kết</TableHead>
                      <TableHead className="text-right">Ghi nhận</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAnalytics ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-36 text-center">
                          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : honorStudents.length ? (
                      honorStudents.map((item) => (
                        <TableRow key={`${item.maSV}-${item.maMH}`}>
                          <TableCell>
                            <p className="font-medium text-foreground">{item.hoTen}</p>
                            <p className="font-mono text-xs text-muted-foreground">{item.maSV}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.tenLop}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{item.tenMH}</p>
                            <p className="text-xs text-muted-foreground">{item.maMH}</p>
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                            {Number(item.diemCK).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            <ScoreBadge score={Number(item.diemTongKet)} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:text-amber-300">
                              <Sparkles className="mr-1 size-3 text-amber-500" /> Tuyên dương
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                          Không có sinh viên nào đạt điểm cuối kỳ ≥ {honorMinScore} ở môn này.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {/* Sub-tab 2: No-Grade Students (Câu 9) */}
          {analyticsSubTab === "nograde" ? (
            <Card>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-base font-semibold">
                  Danh sách sinh viên chưa có bất kỳ điểm nào (Câu 9)
                </CardTitle>
                <CardDescription>
                  Các hồ sơ sinh viên chưa từng có bản ghi điểm học phần nào trong hệ thống (cần đôn đốc thi/nhập điểm).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Sinh viên</TableHead>
                      <TableHead>Mã SV</TableHead>
                      <TableHead>Lớp</TableHead>
                      <TableHead>Khoa</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAnalytics ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-36 text-center">
                          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : noGradeStudents.length ? (
                      noGradeStudents.map((s) => (
                        <TableRow key={s.maSV}>
                          <TableCell className="font-medium text-foreground">{s.hoTen}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {s.maSV}
                            </Badge>
                          </TableCell>
                          <TableCell>{s.maLop}</TableCell>
                          <TableCell>{s.tenKhoa || s.maKhoa || "—"}</TableCell>
                          <TableCell className="font-mono">{s.soDienThoai}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() => openGradeDialog({ maSV: s.maSV })}
                            >
                              <Plus className="mr-1 size-3.5" /> Nhập điểm
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-sm text-emerald-600">
                          Tất cả sinh viên trong trường đều đã có kết quả điểm!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {/* Sub-tab 3: Course Averages (Câu 7) */}
          {analyticsSubTab === "courseavg" ? (
            <Card>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <CardTitle className="text-base font-semibold">
                  Thống kê điểm thi cuối kỳ trung bình theo môn học (Câu 7)
                </CardTitle>
                <CardDescription>
                  Tổng hợp điểm thi cuối kỳ trung bình (DiemCK) và số lượng sinh viên đã tham gia học của từng môn.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Mã môn</TableHead>
                      <TableHead>Tên môn học</TableHead>
                      <TableHead className="text-center">Số tín chỉ</TableHead>
                      <TableHead className="text-center">Số lượng SV đã học</TableHead>
                      <TableHead className="text-center">Điểm cuối kỳ TB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingAnalytics ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-36 text-center">
                          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : courseAverages.length ? (
                      courseAverages.map((c) => (
                        <TableRow key={c.maMH}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {c.maMH}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{c.tenMH}</TableCell>
                          <TableCell className="text-center font-medium">{c.soTinChi}</TableCell>
                          <TableCell className="text-center font-mono font-semibold">
                            {c.soLuongSinhVien} SV
                          </TableCell>
                          <TableCell className="text-center">
                            <ScoreBadge score={Number(c.diemCKTrungBinh)} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                          Chưa có dữ liệu thống kê điểm theo môn học.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Modal Dialog: Add / Edit Grade */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-5 py-4 sm:px-6">
            <DialogTitle>Nhập / Cập nhật điểm học phần</DialogTitle>
            <DialogDescription>
              Nhập điểm CC (10%), GK (30%), CK (60%). Điểm tổng kết hệ 10 sẽ được tự động tính toán.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveGrade} className="grid gap-5 px-5 py-5 sm:px-6">
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(formErrors.maSV)}>
                <FieldLabel htmlFor="grade-sv">Sinh viên</FieldLabel>
                <Select
                  value={formValues.maSV}
                  onValueChange={(val) => {
                    setFormValues((curr) => ({ ...curr, maSV: val ?? "" }))
                    setFormErrors((curr) => ({ ...curr, maSV: "" }))
                  }}
                  disabled={submittingGrade}
                >
                  <SelectTrigger id="grade-sv" className="w-full" aria-invalid={Boolean(formErrors.maSV)}>
                    <SelectValue placeholder="Chọn sinh viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {students.map((s) => (
                        <SelectItem key={s.maSV} value={s.maSV}>
                          {s.maSV} · {s.hoTen} ({s.maLop})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{formErrors.maSV}</FieldError>
              </Field>

              <Field data-invalid={Boolean(formErrors.maMH)}>
                <FieldLabel htmlFor="grade-mh">Môn học</FieldLabel>
                <Select
                  value={formValues.maMH}
                  onValueChange={(val) => {
                    setFormValues((curr) => ({ ...curr, maMH: val ?? "" }))
                    setFormErrors((curr) => ({ ...curr, maMH: "" }))
                  }}
                  disabled={submittingGrade}
                >
                  <SelectTrigger id="grade-mh" className="w-full" aria-invalid={Boolean(formErrors.maMH)}>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {courses.map((c) => (
                        <SelectItem key={c.maMH} value={c.maMH}>
                          {c.maMH} · {c.tenMH} ({c.soTinChi} TC)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{formErrors.maMH}</FieldError>
              </Field>

              <Field data-invalid={Boolean(formErrors.maHK)} className="sm:col-span-2">
                <FieldLabel htmlFor="grade-hk">Học kỳ</FieldLabel>
                <Select
                  value={formValues.maHK}
                  onValueChange={(val) => {
                    setFormValues((curr) => ({ ...curr, maHK: val ?? "" }))
                    setFormErrors((curr) => ({ ...curr, maHK: "" }))
                  }}
                  disabled={submittingGrade}
                >
                  <SelectTrigger id="grade-hk" className="w-full" aria-invalid={Boolean(formErrors.maHK)}>
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {semesters.map((s) => (
                        <SelectItem key={s.maHK} value={s.maHK}>
                          {s.tenHocKy || `Học kỳ ${s.ky} (${s.namHoc})`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{formErrors.maHK}</FieldError>
              </Field>
            </FieldGroup>

            {/* Score inputs */}
            <div className="rounded-xl border bg-muted/25 p-4">
              <p className="mb-3 text-xs font-semibold text-foreground">Thành phần điểm thi</p>
              <FieldGroup className="grid gap-3 sm:grid-cols-3">
                {([
                  ["diemCC", "Chuyên cần", "Hệ số 0.1"],
                  ["diemGK", "Giữa kỳ", "Hệ số 0.3"],
                  ["diemCK", "Cuối kỳ", "Hệ số 0.6"],
                ] as const).map(([key, label, hint]) => (
                  <Field key={key} data-invalid={Boolean(formErrors[key])}>
                    <FieldLabel htmlFor={`input-${key}`}>{label}</FieldLabel>
                    <Input
                      id={`input-${key}`}
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      inputMode="decimal"
                      value={formValues[key]}
                      disabled={submittingGrade}
                      onChange={(e) => {
                        setFormValues((curr) => ({ ...curr, [key]: e.target.value }))
                        setFormErrors((curr) => ({ ...curr, [key]: "" }))
                      }}
                      placeholder="0.00"
                      className="font-mono text-center"
                      aria-invalid={Boolean(formErrors[key])}
                    />
                    <FieldDescription className="text-center text-[10px]">{hint}</FieldDescription>
                    <FieldError>{formErrors[key]}</FieldError>
                  </Field>
                ))}
              </FieldGroup>
            </div>

            {/* Live calculation banner */}
            <div className="flex items-center justify-between rounded-xl bg-primary/[0.08] p-4">
              <div>
                <p className="text-xs text-muted-foreground">Điểm tổng kết dự kiến</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {previewTotal === null ? "—" : previewTotal.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">/ 10</span>
                </p>
              </div>
              {previewTotal !== null ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Đánh giá kết quả</p>
                  <Badge variant={previewTotal >= 4.0 ? "secondary" : "destructive"} className="mt-0.5">
                    {previewTotal >= 4.0 ? "Đạt học phần" : "Học lại"}
                  </Badge>
                </div>
              ) : null}
            </div>

            <DialogFooter className="-mx-5 -mb-5 border-t px-5 py-4 sm:-mx-6 sm:-mb-5 sm:px-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submittingGrade}>
                Hủy
              </Button>
              <Button type="submit" disabled={submittingGrade}>
                {submittingGrade ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Lưu kết quả điểm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bản ghi điểm học phần?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang xóa điểm môn{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.tenMH || deleteTarget?.maMH}
              </span>{" "}
              của sinh viên{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.maSV}</span> tại học kỳ{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.maHK}</span>. Thao tác này không thể hoàn tác.
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
