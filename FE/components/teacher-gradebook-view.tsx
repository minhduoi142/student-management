"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Loader2,
  RefreshCw,
  Save,
  Undo2,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  catalogService,
  gradeService,
  type LopHocPhanDiemItemResponse,
  type LopHocPhanDiemResponse,
  type PhanCongResponse,
} from "@/services"

interface EditableGradeRow extends LopHocPhanDiemItemResponse {
  rawCC: string
  rawGK: string
  rawCK: string
  isDirty?: boolean
}

export function TeacherGradebookView({
  maGV,
  initialLop,
  initialMH,
  initialHK,
  onBack,
}: {
  maGV?: string
  initialLop?: string
  initialMH?: string
  initialHK?: string
  onBack?: () => void
}) {
  const effectiveMaGV = maGV || "GV01"

  const [assignments, setAssignments] = useState<PhanCongResponse[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)

  const [selectedLop, setSelectedLop] = useState<string>(initialLop || "")
  const [selectedMH, setSelectedMH] = useState<string>(initialMH || "")
  const [selectedHK, setSelectedHK] = useState<string>(initialHK || "")

  const [gradebook, setGradebook] = useState<LopHocPhanDiemResponse | null>(null)
  const [rows, setRows] = useState<EditableGradeRow[]>([])
  const [loadingGradebook, setLoadingGradebook] = useState(false)
  const [saving, setSaving] = useState(false)

  // Tải danh sách phân công của giảng viên để làm bộ chọn lớp học phần
  useEffect(() => {
    async function fetchAssignments() {
      try {
        const data = await catalogService.getPhanCongByGiangVien(effectiveMaGV)
        setAssignments(data || [])
        if (data && data.length > 0 && !selectedLop) {
          const first = data[0]
          setSelectedLop(first.maLop)
          setSelectedMH(first.maMH)
          setSelectedHK(first.maHK)
        }
      } catch {
        toast.error("Không thể tải danh sách lớp học phần phân công.")
      } finally {
        setLoadingAssignments(false)
      }
    }
    fetchAssignments()
  }, [effectiveMaGV])

  // Khi chọn lớp học phần, tải sổ điểm
  const loadGradebook = async () => {
    if (!selectedLop || !selectedMH || !selectedHK) return
    setLoadingGradebook(true)
    try {
      const data = await gradeService.getDiemLopHocPhan(selectedLop, selectedMH, selectedHK)
      setGradebook(data)
      const mapped: EditableGradeRow[] = (data.danhSachSinhVien || []).map((sv) => ({
        ...sv,
        rawCC: sv.diemCC !== null && sv.diemCC !== undefined ? String(sv.diemCC) : "",
        rawGK: sv.diemGK !== null && sv.diemGK !== undefined ? String(sv.diemGK) : "",
        rawCK: sv.diemCK !== null && sv.diemCK !== undefined ? String(sv.diemCK) : "",
        isDirty: false,
      }))
      setRows(mapped)
    } catch {
      toast.error("Không thể tải sổ điểm lớp học phần.")
    } finally {
      setLoadingGradebook(false)
    }
  }

  useEffect(() => {
    if (selectedLop && selectedMH && selectedHK) {
      loadGradebook()
    }
  }, [selectedLop, selectedMH, selectedHK])

  const handleSelectClass = (val: string) => {
    const found = assignments.find((a) => `${a.maLop}__${a.maMH}__${a.maHK}` === val)
    if (found) {
      setSelectedLop(found.maLop)
      setSelectedMH(found.maMH)
      setSelectedHK(found.maHK)
    }
  }

  // Cập nhật giá trị điểm của sinh viên trên dòng
  const handleScoreChange = (
    index: number,
    field: "rawCC" | "rawGK" | "rawCK",
    val: string
  ) => {
    // Chỉ cho phép nhập số thực từ 0.00 đến 10.00
    if (val !== "" && !/^\d*\.?\d*$/.test(val)) return

    const num = parseFloat(val)
    if (!isNaN(num) && (num < 0 || num > 10)) {
      toast.warning("Điểm thành phần phải từ 0.00 đến 10.00")
      return
    }

    setRows((prev) => {
      const updated = [...prev]
      const row = { ...updated[index], [field]: val, isDirty: true }

      // Tính realtime điểm tổng kết nếu đủ 3 đầu điểm
      const cc = parseFloat(row.rawCC)
      const gk = parseFloat(row.rawGK)
      const ck = parseFloat(row.rawCK)

      if (!isNaN(cc) && !isNaN(gk) && !isNaN(ck)) {
        const tk = parseFloat((cc * 0.1 + gk * 0.3 + ck * 0.6).toFixed(2))
        row.diemTK = tk
        if (tk >= 8.5) row.diemChu = "A"
        else if (tk >= 7.0) row.diemChu = "B"
        else if (tk >= 5.5) row.diemChu = "C"
        else if (tk >= 4.0) row.diemChu = "D"
        else row.diemChu = "F"
        row.dat = tk >= 4.0
      } else {
        row.diemTK = null
        row.diemChu = "-"
        row.dat = null
      }

      updated[index] = row
      return updated
    })
  }

  // Thống kê phân bố lớp học phần
  const stats = useMemo(() => {
    const total = rows.length
    const withScores = rows.filter((r) => r.diemTK !== null && r.diemTK !== undefined)
    const passed = withScores.filter((r) => r.dat === true).length
    const failed = withScores.filter((r) => r.dat === false).length

    let avg = 0
    let max = 0
    let min = 10

    if (withScores.length > 0) {
      const sum = withScores.reduce((s, r) => s + (r.diemTK || 0), 0)
      avg = parseFloat((sum / withScores.length).toFixed(2))
      max = Math.max(...withScores.map((r) => r.diemTK || 0))
      min = Math.min(...withScores.map((r) => r.diemTK || 0))
    } else {
      min = 0
    }

    return {
      total,
      entered: withScores.length,
      passed,
      failed,
      avg,
      max,
      min,
      passRate: withScores.length > 0 ? Math.round((passed / withScores.length) * 100) : 0,
    }
  }, [rows])

  const hasDirtyRows = useMemo(() => rows.some((r) => r.isDirty), [rows])

  // Lưu toàn bộ bảng điểm hàng loạt
  const handleBatchSave = async () => {
    if (!selectedLop || !selectedMH || !selectedHK) return

    setSaving(true)
    try {
      const payloadList = rows.map((r) => {
        const cc = r.rawCC !== "" ? parseFloat(r.rawCC) : undefined
        const gk = r.rawGK !== "" ? parseFloat(r.rawGK) : undefined
        const ck = r.rawCK !== "" ? parseFloat(r.rawCK) : undefined
        return {
          maSV: r.maSV,
          maMH: selectedMH,
          maLop: selectedLop,
          maHK: selectedHK,
          diemCC: isNaN(cc as number) ? undefined : cc,
          diemGK: isNaN(gk as number) ? undefined : gk,
          diemCK: isNaN(ck as number) ? undefined : ck,
        }
      })

      await gradeService.saveBatch({
        maLop: selectedLop,
        maMH: selectedMH,
        maHK: selectedHK,
        danhSachDiem: payloadList,
      })

      toast.success("Lưu sổ điểm lớp học phần thành công!")
      // Tải lại dữ liệu mới nhất từ server
      await loadGradebook()
    } catch {
      toast.error("Không thể lưu sổ điểm. Vui lòng kiểm tra lại quyền phân công hoặc dữ liệu điểm.")
    } finally {
      setSaving(false)
    }
  }

  // Khôi phục lại trạng thái ban đầu
  const handleReset = () => {
    loadGradebook()
    toast.info("Đã đặt lại các thay đổi chưa lưu.")
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Chọn lớp học phần */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button type="button" variant="ghost" size="icon" onClick={onBack} title="Quay lại">
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Sổ điểm Học phần
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Nhập và tính điểm chuyên cần (10%), giữa kỳ (30%), cuối kỳ (60%) cho lớp học phần được phân công.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBack && (
            <Button type="button" variant="outline" size="sm" onClick={onBack}>
              Danh sách phân công
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadGradebook}
            disabled={loadingGradebook || saving}
            className="gap-1.5"
          >
            <RefreshCw className={`size-4 ${loadingGradebook ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleBatchSave}
            disabled={saving || !hasDirtyRows}
            className="gap-1.5 bg-primary shadow-sm"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Lưu bảng điểm {hasDirtyRows ? "(Có thay đổi)" : ""}
          </Button>
        </div>
      </div>

      {/* Thanh lựa chọn Lớp học phần */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chọn lớp học phần phụ trách
              </label>
              {loadingAssignments ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải danh sách phân công...
                </div>
              ) : assignments.length === 0 ? (
                <p className="text-sm text-rose-500 font-medium">Bạn chưa được phân công lớp học phần nào.</p>
              ) : (
                <select
                  aria-label="Chọn lớp học phần"
                  value={`${selectedLop}__${selectedMH}__${selectedHK}`}
                  onChange={(e) => handleSelectClass(e.target.value)}
                  className="h-10 w-full sm:max-w-xl rounded-md border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {assignments.map((a) => (
                    <option key={`${a.maLop}__${a.maMH}__${a.maHK}`} value={`${a.maLop}__${a.maMH}__${a.maHK}`}>
                      {a.tenMH || a.maMH} ({a.soTinChi ?? 3} TC) • Lớp {a.tenLop || a.maLop} • Kỳ {a.maHK}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {gradebook && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border">
                <div>Giảng viên: <span className="font-semibold text-foreground">{gradebook.tenGV || effectiveMaGV}</span></div>
                <div>•</div>
                <div>Sĩ số: <span className="font-semibold text-foreground">{gradebook.siSo} SV</span></div>
                <div>•</div>
                <div>Đã vào điểm: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{gradebook.soLuongCoDiem}/{gradebook.siSo}</span></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thẻ thống kê phổ điểm nhanh của lớp */}
      {gradebook && rows.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 text-center">
              <span className="text-[11px] text-muted-foreground">Đã nhập điểm</span>
              <p className="text-xl font-bold">{stats.entered} / {stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 text-center">
              <span className="text-[11px] text-muted-foreground">Điểm TB Lớp</span>
              <p className="text-xl font-bold text-primary">{stats.avg.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 text-center">
              <span className="text-[11px] text-muted-foreground">Điểm Cao nhất</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.max.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 text-center">
              <span className="text-[11px] text-muted-foreground">Điểm Thấp nhất</span>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{stats.min.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 text-center">
              <span className="text-[11px] text-muted-foreground">Số SV Đạt (≥ 4.0)</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.passed}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 text-center">
              <span className="text-[11px] text-muted-foreground">Tỷ lệ Đạt</span>
              <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{stats.passRate}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bảng nhập điểm chi tiết (Interactive Data Grid) */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Danh sách sinh viên & Điểm thành phần</CardTitle>
              <CardDescription>
                Nhập điểm Chuyên cần (10%), Giữa kỳ (30%), Cuối kỳ (60%). Điểm tổng kết tự tính ngay khi nhập đủ 3 đầu điểm.
              </CardDescription>
            </div>
            {hasDirtyRows && (
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-xs">
                  <Undo2 className="size-3.5" />
                  Hủy thay đổi
                </Button>
                <Button type="button" size="sm" onClick={handleBatchSave} disabled={saving} className="gap-1 text-xs">
                  <Save className="size-3.5" />
                  Lưu ngay
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingGradebook ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Đang tải sổ điểm lớp học phần...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-center">
              <FileSpreadsheet className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium">Lớp học này chưa có sinh viên đăng ký hoặc chưa có dữ liệu.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10 text-center">STT</TableHead>
                    <TableHead className="w-32">Mã SV</TableHead>
                    <TableHead className="min-w-[180px]">Họ và tên</TableHead>
                    <TableHead className="w-24 text-center">CC (10%)</TableHead>
                    <TableHead className="w-24 text-center">GK (30%)</TableHead>
                    <TableHead className="w-24 text-center">CK (60%)</TableHead>
                    <TableHead className="w-24 text-center bg-primary/5">Tổng kết</TableHead>
                    <TableHead className="w-20 text-center">Điểm chữ</TableHead>
                    <TableHead className="w-24 text-center">Đánh giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => {
                    const tk = row.diemTK
                    return (
                      <TableRow key={row.maSV} className={row.isDirty ? "bg-amber-500/5 dark:bg-amber-500/10" : undefined}>
                        <TableCell className="text-center text-xs font-mono text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{row.maSV}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{row.hoTen}</div>
                          {row.trangThai && row.trangThai !== "DANG_HOC" && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400">
                              {row.trangThai}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Điểm Chuyên cần (10%) */}
                        <TableCell className="text-center p-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={row.rawCC}
                            onChange={(e) => handleScoreChange(idx, "rawCC", e.target.value)}
                            placeholder="0.0"
                            className="h-8 w-20 text-center font-mono text-xs mx-auto focus-visible:ring-1"
                          />
                        </TableCell>

                        {/* Điểm Giữa kỳ (30%) */}
                        <TableCell className="text-center p-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={row.rawGK}
                            onChange={(e) => handleScoreChange(idx, "rawGK", e.target.value)}
                            placeholder="0.0"
                            className="h-8 w-20 text-center font-mono text-xs mx-auto focus-visible:ring-1"
                          />
                        </TableCell>

                        {/* Điểm Cuối kỳ (60%) */}
                        <TableCell className="text-center p-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={row.rawCK}
                            onChange={(e) => handleScoreChange(idx, "rawCK", e.target.value)}
                            placeholder="0.0"
                            className="h-8 w-20 text-center font-mono text-xs mx-auto focus-visible:ring-1"
                          />
                        </TableCell>

                        {/* Điểm Tổng kết */}
                        <TableCell className="text-center bg-primary/5">
                          {tk !== null && tk !== undefined ? (
                            <span
                              className={`font-mono text-sm font-bold ${
                                tk >= 7.0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : tk >= 4.0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {tk.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Điểm chữ */}
                        <TableCell className="text-center font-bold text-xs">
                          {row.diemChu && row.diemChu !== "-" ? (
                            <Badge variant="outline" className="font-mono">{row.diemChu}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        {/* Đánh giá */}
                        <TableCell className="text-center">
                          {row.dat === true ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs">
                              Đạt
                            </Badge>
                          ) : row.dat === false ? (
                            <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 text-xs">
                              Trượt
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Chưa đủ</span>
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
