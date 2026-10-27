"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  catalogService,
  gradeService,
  type BangDiemSinhVienResponse,
  type HocKyResponse,
  type KetQuaResponse,
} from "@/services"

export function StudentPortalView({
  maSV,
  onNavigateToProfile,
}: {
  maSV?: string
  onNavigateToProfile?: () => void
}) {
  const effectiveMaSV = maSV || "B24DCCE001"

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bangDiem, setBangDiem] = useState<BangDiemSinhVienResponse | null>(null)
  const [semesters, setSemesters] = useState<HocKyResponse[]>([])
  const [selectedHK, setSelectedHK] = useState<string>("all")

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [bdData, hkData] = await Promise.all([
        gradeService.getBangDiem(effectiveMaSV, selectedHK === "all" ? undefined : selectedHK),
        catalogService.getAllHocKy().catch(() => []),
      ])
      setBangDiem(bdData)
      setSemesters(hkData || [])
      if (isManualRefresh) toast.success("Đã cập nhật bảng điểm mới nhất.")
    } catch {
      toast.error("Không thể tải bảng điểm sinh viên.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [effectiveMaSV, selectedHK])

  // Tính điểm hệ 4 và xếp loại học lực
  const academicRank = useMemo(() => {
    const gpa10 = bangDiem?.diemTrungBinhTichLuy
    if (gpa10 === null || gpa10 === undefined) {
      return { gpa4: "—", rank: "Chưa có điểm", color: "text-muted-foreground", badgeBg: "bg-muted" }
    }

    // Quy đổi hệ 4 chuẩn
    let gpa4Num = 0
    if (gpa10 >= 8.5) gpa4Num = 4.0
    else if (gpa10 >= 8.0) gpa4Num = 3.5
    else if (gpa10 >= 7.0) gpa4Num = 3.0
    else if (gpa10 >= 6.5) gpa4Num = 2.5
    else if (gpa10 >= 5.5) gpa4Num = 2.0
    else if (gpa10 >= 5.0) gpa4Num = 1.5
    else if (gpa10 >= 4.0) gpa4Num = 1.0
    else gpa4Num = 0.0

    // Xếp loại học lực
    let rank = "Trung bình"
    let color = "text-sky-600 dark:text-sky-400"
    let badgeBg = "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"

    if (gpa10 >= 9.0) {
      rank = "Xuất sắc"
      color = "text-emerald-600 dark:text-emerald-400"
      badgeBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
    } else if (gpa10 >= 8.0) {
      rank = "Giỏi"
      color = "text-emerald-600 dark:text-emerald-400"
      badgeBg = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
    } else if (gpa10 >= 7.0) {
      rank = "Khá"
      color = "text-sky-600 dark:text-sky-400"
      badgeBg = "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
    } else if (gpa10 < 5.0) {
      rank = "Yếu"
      color = "text-rose-600 dark:text-rose-400"
      badgeBg = "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
    }

    return { gpa4: gpa4Num.toFixed(2), rank, color, badgeBg }
  }, [bangDiem?.diemTrungBinhTichLuy])

  // Thống kê phân bố môn học
  const gradeSummary = useMemo(() => {
    const list = bangDiem?.danhSachDiem || []
    const totalSubjects = list.length
    const passed = list.filter((item) => (item.diemTongKet ?? 0) >= 4.0).length
    const failed = totalSubjects - passed
    const totalCredits = list.reduce((sum, item) => sum + (item.soTinChi || 0), 0)
    return { totalSubjects, passed, failed, totalCredits }
  }, [bangDiem?.danhSachDiem])

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Thông tin sinh viên */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Kết quả Học tập
            </h1>
            <Badge className={academicRank.badgeBg}>{academicRank.rank}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Sinh viên: <span className="font-semibold text-foreground">{bangDiem?.hoTen || effectiveMaSV}</span> ({effectiveMaSV}) • Lớp: <span className="font-medium text-foreground">{bangDiem?.tenLop || bangDiem?.maLop || "D24CQCE02-B"}</span> • Khoa: <span className="font-medium text-foreground">{bangDiem?.tenKhoa || "CNTT"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToProfile && (
            <Button type="button" variant="outline" size="sm" onClick={onNavigateToProfile} className="gap-1.5">
              <GraduationCap className="size-4" />
              Hồ sơ cá nhân
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Thẻ chỉ số tổng kết (Academic Summary Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Điểm TB tích lũy (Hệ 10)</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {bangDiem?.diemTrungBinhTichLuy !== null && bangDiem?.diemTrungBinhTichLuy !== undefined
                  ? bangDiem.diemTrungBinhTichLuy.toFixed(2)
                  : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ 10.00</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">CPA toàn khóa học</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Điểm quy đổi (Hệ 4)</CardTitle>
            <Award className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {academicRank.gpa4}
              </span>
              <span className="text-xs text-muted-foreground">/ 4.00</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Thang điểm 4 theo học chế tín chỉ</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tín chỉ tích lũy</CardTitle>
            <BookOpen className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {bangDiem?.tongTinChiTichLuy || 0}
              </span>
              <span className="text-xs text-muted-foreground">tín chỉ</span>
            </div>
            <Progress value={Math.min(100, Math.round(((bangDiem?.tongTinChiTichLuy || 0) / 130) * 100))} className="mt-2 h-1.5" />
            <p className="mt-1 text-[11px] text-muted-foreground">Tiến độ ~{Math.min(100, Math.round(((bangDiem?.tongTinChiTichLuy || 0) / 130) * 100))}% chương trình (130 TC)</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Học phần hoàn thành</CardTitle>
            <CheckCircle2 className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                {gradeSummary.passed}
              </span>
              <span className="text-xs text-muted-foreground">/ {gradeSummary.totalSubjects} môn</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {gradeSummary.failed > 0 ? (
                <span className="text-rose-500 font-medium">{gradeSummary.failed} môn chưa đạt</span>
              ) : (
                <span className="text-emerald-500 font-medium">Đạt 100% các môn đã học</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc học kỳ & Bảng chi tiết kết quả */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Bảng điểm chi tiết học phần</CardTitle>
              <CardDescription>
                Chi tiết các đầu điểm Chuyên cần (10%), Giữa kỳ (30%), Cuối kỳ (60%) và Điểm tổng kết theo từng môn.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <select
                aria-label="Lọc theo học kỳ"
                value={selectedHK}
                onChange={(e) => setSelectedHK(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Toàn bộ khóa học</option>
                {semesters.map((hk) => (
                  <option key={hk.maHK} value={hk.maHK}>
                    {hk.tenHocKy || hk.maHK}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Đang tải bảng điểm học tập...</p>
            </div>
          ) : !bangDiem || bangDiem.danhSachDiem.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <FileSpreadsheet className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium">Chưa có dữ liệu điểm trong học kỳ này.</p>
              <p className="text-xs text-muted-foreground">Điểm sẽ xuất hiện sau khi giảng viên hoàn tất nhập điểm học phần.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-12 text-center">STT</TableHead>
                    <TableHead className="w-28">Mã môn</TableHead>
                    <TableHead>Tên môn học</TableHead>
                    <TableHead className="text-center w-20">Học kỳ</TableHead>
                    <TableHead className="text-center w-16">Số TC</TableHead>
                    <TableHead className="text-center w-24">CC (10%)</TableHead>
                    <TableHead className="text-center w-24">GK (30%)</TableHead>
                    <TableHead className="text-center w-24">CK (60%)</TableHead>
                    <TableHead className="text-center w-24 bg-primary/5 font-bold">Tổng kết</TableHead>
                    <TableHead className="text-center w-20">Điểm chữ</TableHead>
                    <TableHead className="text-center w-24">Kết quả</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bangDiem.danhSachDiem.map((item, idx) => {
                    const tk = item.diemTongKet
                    let letter = "-"
                    let isPass = false

                    if (tk !== null && tk !== undefined) {
                      if (tk >= 8.5) letter = "A"
                      else if (tk >= 7.0) letter = "B"
                      else if (tk >= 5.5) letter = "C"
                      else if (tk >= 4.0) letter = "D"
                      else letter = "F"
                      isPass = tk >= 4.0
                    }

                    return (
                      <TableRow key={`${item.maMH}-${item.maHK}-${idx}`}>
                        <TableCell className="text-center text-xs text-muted-foreground font-mono">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{item.maMH}</TableCell>
                        <TableCell className="font-medium text-sm">{item.tenMH || item.maMH}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs font-mono">{item.maHK}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs font-semibold">{item.soTinChi ?? 3}</TableCell>
                        <TableCell className="text-center text-xs font-mono">{item.diemCC?.toFixed(2) ?? "—"}</TableCell>
                        <TableCell className="text-center text-xs font-mono">{item.diemGK?.toFixed(2) ?? "—"}</TableCell>
                        <TableCell className="text-center text-xs font-mono">{item.diemCK?.toFixed(2) ?? "—"}</TableCell>
                        <TableCell className="text-center bg-primary/5">
                          {tk !== null && tk !== undefined ? (
                            <span
                              className={`font-mono text-sm font-bold ${
                                isPass
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {tk.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {letter !== "-" ? (
                            <Badge variant="outline" className="font-mono text-xs font-bold">{letter}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {tk !== null && tk !== undefined ? (
                            isPass ? (
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs">
                                Đạt
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 text-xs">
                                Học lại
                              </Badge>
                            )
                          ) : (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                              Chưa có
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
