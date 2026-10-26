"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Building2,
  GraduationCap,
  Landmark,
  Layers3,
  Loader2,
  RefreshCw,
  UsersRound,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"
import { InitialAvatar, PageHeading, RequestBadge } from "@/components/admin-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { statService } from "@/services"
import type {
  DashboardOverviewResponse,
  DiemTrungBinhMonResponse,
  MonHocResponse,
  SiSoLopResponse,
  SinhVienResponse,
  ThongKeHocKyResponse,
} from "@/services/types"
import { getErrorMessage } from "@/lib/api-client"
import { toast } from "sonner"

const classChartConfig = {
  siSo: { label: "Sĩ số", color: "var(--chart-1)" },
} satisfies ChartConfig

const semesterChartConfig = {
  soLuongKetQua: { label: "Bản ghi điểm", color: "var(--chart-2)" },
} satisfies ChartConfig

const courseChartConfig = {
  diemCKTrungBinh: { label: "Điểm cuối kỳ", color: "var(--chart-3)" },
} satisfies ChartConfig

const metricMeta = [
  { key: "tongSoSinhVien", label: "Sinh viên", hint: "Hồ sơ đang quản lý", icon: UsersRound, href: "/sinh-vien", iconClass: "bg-primary/10 text-primary" },
  { key: "tongSoGiangVien", label: "Giảng viên", hint: "Đội ngũ giảng dạy", icon: GraduationCap, href: "/giang-vien", iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  { key: "tongSoLop", label: "Lớp học", hint: "Lớp đang vận hành", icon: Layers3, href: "/lop", iconClass: "bg-primary/10 text-primary" },
  { key: "tongSoKhoa", label: "Khoa", hint: "Đơn vị đào tạo", icon: Landmark, href: "/khoa", iconClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { key: "tongSoMonHoc", label: "Môn học", hint: "Môn trong chương trình", icon: BookOpenCheck, href: "/mon-hoc", iconClass: "bg-primary/10 text-primary" },
  { key: "tongSoBanGhiDiem", label: "Bản ghi điểm", hint: "Kết quả đã nhập", icon: Activity, href: "/diem", iconClass: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
] as const

const defaultStats: DashboardOverviewResponse = {
  tongSoSinhVien: 0,
  tongSoGiangVien: 0,
  tongSoLop: 0,
  tongSoKhoa: 0,
  tongSoMonHoc: 0,
  tongSoHocKy: 0,
  tongSoBanGhiDiem: 0,
}

export function DashboardView() {
  const [stats, setStats] = useState<DashboardOverviewResponse>(defaultStats)
  const [classData, setClassData] = useState<SiSoLopResponse[]>([])
  const [semesterData, setSemesterData] = useState<ThongKeHocKyResponse[]>([])
  const [courseData, setCourseData] = useState<DiemTrungBinhMonResponse[]>([])
  const [noGradeStudents, setNoGradeStudents] = useState<SinhVienResponse[]>([])
  const [noGradeCourses, setNoGradeCourses] = useState<MonHocResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    try {
      const [
        dashboardRes,
        siSoRes,
        semesterRes,
        courseAvgRes,
        noGradeStudentsRes,
        noGradeCoursesRes,
      ] = await Promise.allSettled([
        statService.getDashboard(),
        statService.getSiSoLop(),
        statService.getSoLuongDiemTheoHocKy(),
        statService.getDiemTrungBinhMon(),
        statService.getSinhVienChuaCoDiem(),
        statService.getMonHocChuaCoKetQua(),
      ])

      if (dashboardRes.status === "fulfilled") setStats(dashboardRes.value)
      if (siSoRes.status === "fulfilled") setClassData(siSoRes.value || [])
      if (semesterRes.status === "fulfilled") setSemesterData(semesterRes.value || [])
      if (courseAvgRes.status === "fulfilled") setCourseData(courseAvgRes.value || [])
      if (noGradeStudentsRes.status === "fulfilled") setNoGradeStudents(noGradeStudentsRes.value || [])
      if (noGradeCoursesRes.status === "fulfilled") setNoGradeCourses(noGradeCoursesRes.value || [])

      if (isManual) toast.success("Đã làm mới dữ liệu thống kê")
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải số liệu thống kê từ máy chủ"))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="animate-in fade-in-0 duration-300">
      <PageHeading
        eyebrow="Trung tâm quản trị học vụ"
        title="Tổng quan"
        description="Theo dõi nhanh tình hình đào tạo, hồ sơ sinh viên và tiến độ nhập điểm của toàn trường."
        actions={
          <>
            <RequestBadge>GET /api/v1/thong-ke/dashboard</RequestBadge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={loading || refreshing}
            >
              <RefreshCw className={refreshing ? "animate-spin" : ""} data-icon="inline-start" />
              Làm mới
            </Button>
          </>
        }
      />

      <section aria-label="Chỉ số học vụ" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metricMeta.map((metric) => {
          const Icon = metric.icon
          const value = stats[metric.key] ?? 0
          return (
            <Link
              key={metric.key}
              href={metric.href}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full min-h-[142px] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardHeader className="pb-1">
                  <div className={`flex size-9 items-center justify-center rounded-xl ${metric.iconClass}`}>
                    <Icon aria-hidden="true" />
                  </div>
                  <CardAction>
                    <ArrowRight className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  <div className="text-[26px] font-semibold leading-none tracking-tight tabular-nums">
                    {loading ? (
                      <span className="inline-block h-6 w-12 animate-pulse rounded bg-muted" />
                    ) : (
                      value.toLocaleString("vi-VN")
                    )}
                  </div>
                  <div className="text-sm font-medium">{metric.label}</div>
                  <p className="text-xs text-muted-foreground">{metric.hint}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </section>

      <section aria-label="Biểu đồ tổng hợp" className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Sĩ số theo lớp</CardTitle>
              <CardDescription className="mt-1">Phân bố sinh viên theo lớp học hiện tại</CardDescription>
            </div>
            <Building2 className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải biểu đồ sĩ số...
              </div>
            ) : classData.length ? (
              <ChartContainer config={classChartConfig} className="h-[250px] w-full aspect-auto">
                <BarChart accessibilityLayer data={classData} margin={{ top: 10, right: 12, left: -16, bottom: 4 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="maLop"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => String(value).replace("D24CQ", "").replace("D23CQ", "").replace("-B", "")}
                  />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="siSo" fill="var(--color-siSo)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu sĩ số lớp
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Kết quả theo học kỳ</CardTitle>
              <CardDescription className="mt-1">Số bản ghi điểm đã được cập nhật</CardDescription>
            </div>
            <Activity className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải kết quả học kỳ...
              </div>
            ) : semesterData.length ? (
              <ChartContainer config={semesterChartConfig} className="h-[250px] w-full aspect-auto">
                <LineChart accessibilityLayer data={semesterData} margin={{ top: 16, right: 16, left: -16, bottom: 2 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="maHK" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    dataKey="soLuongKetQua"
                    type="monotone"
                    stroke="var(--color-soLuongKetQua)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-soLuongKetQua)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu bản ghi điểm theo học kỳ
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Điểm cuối kỳ theo môn</CardTitle>
              <CardDescription className="mt-1">Điểm trung bình trên thang 10</CardDescription>
            </div>
            <GraduationCap className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải điểm trung bình môn...
              </div>
            ) : courseData.length ? (
              <ChartContainer config={courseChartConfig} className="h-[250px] w-full aspect-auto">
                <BarChart accessibilityLayer data={courseData} layout="vertical" margin={{ top: 6, right: 18, left: 0, bottom: 4 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="4 4" />
                  <XAxis type="number" domain={[0, 10]} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="maMH" width={72} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="diemCKTrungBinh" fill="var(--color-diemCKTrungBinh)" radius={[0, 6, 6, 0]} maxBarSize={26} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                Chưa có dữ liệu điểm trung bình môn
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Cần theo dõi</CardTitle>
            <CardDescription className="mt-1">Các hồ sơ và môn học chưa có kết quả</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="students">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students" className="gap-2">
                  Sinh viên{" "}
                  <Badge variant="secondary" className="h-5 rounded-md px-1.5">
                    {noGradeStudents.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="courses" className="gap-2">
                  Môn học{" "}
                  <Badge variant="secondary" className="h-5 rounded-md px-1.5">
                    {noGradeCourses.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="students" className="mt-4">
                {noGradeStudents.length ? (
                  <div className="grid gap-2">
                    {noGradeStudents.slice(0, 4).map((student) => (
                      <Link
                        key={student.maSV}
                        href="/sinh-vien"
                        className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/60"
                      >
                        <InitialAvatar name={student.hoTen} className="size-9" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{student.hoTen}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {student.maSV} · {student.maLop}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          Chưa có điểm
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    Tất cả sinh viên đã có kết quả học tập.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="courses" className="mt-4">
                {noGradeCourses.length ? (
                  <div className="grid gap-2">
                    {noGradeCourses.map((course) => (
                      <Link
                        key={course.maMH}
                        href="/diem"
                        className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-3 transition-colors hover:bg-muted/60"
                      >
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-sky-500/10 text-sky-700 dark:text-sky-300">
                            MH
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{course.tenMH}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.maMH} · {course.soTinChi} tín chỉ
                          </p>
                        </div>
                        <Badge variant="outline">Chưa nhập điểm</Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    Không có môn học nào đang chờ nhập điểm.
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>Đồng bộ từ máy chủ học vụ</span>
              <Link href="/diem" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                Mở quản lý điểm <ArrowRight />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
