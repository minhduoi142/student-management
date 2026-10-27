"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { catalogService, studentService, type HocKyResponse, type PhanCongResponse, type SinhVienResponse } from "@/services"

export function TeacherDashboardView({
  maGV,
  onNavigateToGradebook,
}: {
  maGV?: string
  onNavigateToGradebook: (maLop: string, maMH: string, maHK: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [assignments, setAssignments] = useState<PhanCongResponse[]>([])
  const [semesters, setSemesters] = useState<HocKyResponse[]>([])
  const [selectedHK, setSelectedHK] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal xem danh sách sinh viên của lớp
  const [viewingClass, setViewingClass] = useState<{ maLop: string; tenLop: string } | null>(null)
  const [classStudents, setClassStudents] = useState<SinhVienResponse[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const effectiveMaGV = maGV || "GV01"

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [pcData, hkData] = await Promise.all([
        catalogService.getPhanCongByGiangVien(effectiveMaGV, selectedHK === "all" ? undefined : selectedHK),
        catalogService.getAllHocKy().catch(() => []),
      ])
      setAssignments(pcData || [])
      setSemesters(hkData || [])
      if (isManualRefresh) toast.success("Đã làm mới dữ liệu phân công giảng dạy.")
    } catch {
      toast.error("Không thể tải danh sách phân công giảng dạy.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [effectiveMaGV, selectedHK])

  const filteredAssignments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return assignments
    return assignments.filter(
      (item) =>
        item.maMH.toLowerCase().includes(q) ||
        (item.tenMH && item.tenMH.toLowerCase().includes(q)) ||
        item.maLop.toLowerCase().includes(q) ||
        (item.tenLop && item.tenLop.toLowerCase().includes(q))
    )
  }, [assignments, searchQuery])

  // Thống kê nhanh
  const stats = useMemo(() => {
    const totalClasses = assignments.length
    const totalStudents = assignments.reduce((sum, item) => sum + (item.siSo || 0), 0)
    const totalWithGrades = assignments.reduce((sum, item) => sum + (item.soLuongCoDiem || 0), 0)
    const completionRate = totalStudents > 0 ? Math.round((totalWithGrades / totalStudents) * 100) : 0
    return { totalClasses, totalStudents, totalWithGrades, completionRate }
  }, [assignments])

  const handleOpenClassStudents = async (maLop: string, tenLop: string) => {
    setViewingClass({ maLop, tenLop })
    setLoadingStudents(true)
    try {
      const res = await studentService.getStudents({ maLop, size: 100 })
      setClassStudents(res.content || [])
    } catch {
      toast.error("Không thể tải danh sách sinh viên của lớp.")
    } finally {
      setLoadingStudents(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Thao tác */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Tổng quan Giảng dạy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Danh sách các lớp học phần và tiến độ vào điểm được phân công cho Giảng viên ({effectiveMaGV}).
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Thẻ thống kê KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lớp học phần</CardTitle>
            <Layers3 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="mt-1 text-xs text-muted-foreground">Phân công trong học kỳ</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng sinh viên</CardTitle>
            <UsersRound className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="mt-1 text-xs text-muted-foreground">Quy mô các lớp giảng dạy</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tiến độ vào điểm</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.completionRate}%</span>
              <span className="text-xs text-muted-foreground">({stats.totalWithGrades}/{stats.totalStudents})</span>
            </div>
            <Progress value={stats.completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trạng thái kỳ học</CardTitle>
            <CalendarDays className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold truncate">
              {semesters.find((s) => s.maHK === selectedHK)?.tenHocKy || "Học kỳ hiện tại"}
            </div>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Hệ thống đang mở nộp điểm</p>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Lớp học phần phụ trách</CardTitle>
              <CardDescription>Chọn lớp học phần để nhập điểm CC, GK, CK hoặc kiểm tra danh sách sinh viên.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm môn học, mã lớp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              <select
                aria-label="Lọc theo học kỳ"
                value={selectedHK}
                onChange={(e) => setSelectedHK(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tất cả các học kỳ</option>
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
              <p className="text-sm text-muted-foreground">Đang tải danh sách phân công giảng dạy...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <BookOpen className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium">Chưa có lớp học phần nào được phân công.</p>
              <p className="text-xs text-muted-foreground">Vui lòng liên hệ Phòng Đào tạo để cập nhật phân công giảng dạy.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-12 text-center">STT</TableHead>
                    <TableHead>Môn học</TableHead>
                    <TableHead>Lớp sinh viên</TableHead>
                    <TableHead className="text-center">Học kỳ</TableHead>
                    <TableHead className="text-center">Số TC</TableHead>
                    <TableHead className="text-center">Sĩ số</TableHead>
                    <TableHead className="text-center">Đã vào điểm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((item, idx) => {
                    const siSo = item.siSo || 0
                    const coDiem = item.soLuongCoDiem || 0
                    const isCompleted = siSo > 0 && coDiem >= siSo
                    const isPartial = coDiem > 0 && coDiem < siSo

                    return (
                      <TableRow key={item.maPC || `${item.maMH}-${item.maLop}-${item.maHK}`}>
                        <TableCell className="text-center text-xs text-muted-foreground font-mono">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{item.tenMH || item.maMH}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.maMH}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.tenLop || item.maLop}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.maLop}</div>
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono">
                          <Badge variant="outline">{item.maHK}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-xs">{item.soTinChi ?? 3}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                            onClick={() => handleOpenClassStudents(item.maLop, item.tenLop || item.maLop)}
                          >
                            {siSo} SV
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          {isCompleted ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                              Đủ ({coDiem}/{siSo})
                            </Badge>
                          ) : isPartial ? (
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
                              Đang nhập ({coDiem}/{siSo})
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              Chưa nhập ({coDiem}/{siSo})
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onNavigateToGradebook(item.maLop, item.maMH, item.maHK)}
                            className="gap-1.5"
                          >
                            <span>Vào sổ điểm</span>
                            <ChevronRight className="size-3.5" />
                          </Button>
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

      {/* Modal xem danh sách sinh viên của lớp */}
      <Dialog open={Boolean(viewingClass)} onOpenChange={(open) => !open && setViewingClass(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Danh sách sinh viên lớp {viewingClass?.tenLop} ({viewingClass?.maLop})</DialogTitle>
            <DialogDescription>Danh sách sinh viên chính khóa theo dữ liệu đào tạo.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1">
            {loadingStudents ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : classStudents.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Lớp học hiện chưa có sinh viên nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center">STT</TableHead>
                    <TableHead>Mã SV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Ngày sinh</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((sv, i) => (
                    <TableRow key={sv.maSV}>
                      <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{sv.maSV}</TableCell>
                      <TableCell className="text-sm font-medium">{sv.hoTen}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{sv.ngaySinh || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {sv.trangThai === "DANG_HOC" ? "Đang học" : sv.trangThai || "Đang học"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
