"use client"

import { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  Building2,
  Camera,
  GraduationCap,
  Layers3,
  Loader2,
  Mail,
  Phone,
  Trash2,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { authService, catalogService, fileService, type GiangVienResponse, type PhanCongResponse } from "@/services"

export function TeacherProfileView({
  maGV,
  onNavigateToGradebook,
}: {
  maGV?: string
  onNavigateToGradebook?: (maLop: string, maMH: string, maHK: string) => void
}) {
  const currentUser = authService.getCurrentUser()
  const effectiveMaGV = maGV || currentUser?.maGV || "GV01"

  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [teacher, setTeacher] = useState<GiangVienResponse | null>(null)
  const [assignments, setAssignments] = useState<PhanCongResponse[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [gvData, pcData] = await Promise.all([
          catalogService.getGiangVienById(effectiveMaGV).catch(() => null),
          catalogService.getPhanCongByGiangVien(effectiveMaGV).catch(() => []),
        ])
        setTeacher(gvData)
        setAssignments(pcData || [])
        if (gvData?.avatarUrl) {
          authService.updateCurrentUserAvatar(gvData.avatarUrl)
        }
      } catch {
        toast.error("Không thể tải thông tin giảng viên.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [effectiveMaGV])

  // Lắng nghe sự kiện cập nhật avatar từ Header hoặc Dialog
  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>
      setTeacher((prev) => (prev ? { ...prev, avatarUrl: customEvent.detail || undefined } : null))
    }
    window.addEventListener("user-avatar-updated", handleAvatarUpdate)
    return () => window.removeEventListener("user-avatar-updated", handleAvatarUpdate)
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh đại diện không được vượt quá 5MB.")
      return
    }

    setUploadingAvatar(true)
    try {
      const res = await fileService.uploadSelfAvatar(file)
      setTeacher((prev) => (prev ? { ...prev, avatarUrl: res.avatarUrl } : null))
      toast.success("Cập nhật ảnh đại diện giảng viên thành công!")
    } catch {
      toast.error("Không thể tải lên ảnh đại diện. Vui lòng thử lại.")
    } finally {
      setUploadingAvatar(false)
      if (e.target) e.target.value = ""
    }
  }

  const handleAvatarDelete = async () => {
    setUploadingAvatar(true)
    try {
      await fileService.deleteSelfAvatar()
      setTeacher((prev) => (prev ? { ...prev, avatarUrl: undefined } : null))
      toast.success("Đã xóa ảnh đại diện, chuyển về avatar chữ cái.")
    } catch {
      toast.error("Không thể xóa ảnh đại diện. Vui lòng thử lại.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tải hồ sơ giảng viên...</p>
      </div>
    )
  }

  const currentAvatarUrl =
    teacher?.avatarUrl || (currentUser?.maGV === effectiveMaGV ? currentUser?.avatarUrl : undefined)

  const initials = teacher?.hoTen
    ? teacher.hoTen
        .split(" ")
        .map((p) => p[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "GV"

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Hồ sơ Giảng viên
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Thông tin cán bộ giảng dạy và lịch sử các học phần được phân công.
        </p>
      </div>

      {/* Thẻ định danh Giảng viên */}
      <Card className="relative overflow-hidden border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-background to-primary/10 p-6 shadow-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="size-20 border-2 border-sky-500/30 shadow-inner">
                {currentAvatarUrl && (
                  <AvatarImage src={currentAvatarUrl} alt={teacher?.hoTen} />
                )}
                <AvatarFallback className="bg-sky-600 text-xl font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-600 text-white shadow-md hover:bg-sky-700 transition-transform active:scale-95 border-2 border-background cursor-pointer"
                title="Thay đổi ảnh đại diện giảng viên"
                aria-label="Thay đổi ảnh đại diện giảng viên"
              >
                {uploadingAvatar ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Camera className="size-3.5" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{teacher?.hoTen || effectiveMaGV}</h2>
                <Badge className="bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30">
                  Giảng viên
                </Badge>
              </div>
              <p className="font-mono text-sm font-semibold text-muted-foreground mt-0.5">
                Mã GV: <span className="text-foreground">{effectiveMaGV}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>Khoa: <strong className="text-foreground">{teacher?.tenKhoa || teacher?.maKhoa || "Công nghệ thông tin"}</strong></span>
              </p>

              {currentAvatarUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingAvatar}
                    onClick={handleAvatarDelete}
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3 mr-1" />
                    Xóa ảnh đại diện
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin liên hệ */}
        <Card className="md:col-span-1 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Thông tin liên lạc</CardTitle>
            <CardDescription className="text-xs">Thông tin phục vụ công tác giảng dạy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5" /> Email cơ quan
              </span>
              <p className="font-medium text-foreground mt-0.5">{teacher?.email || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5" /> Số điện thoại
              </span>
              <p className="font-medium text-foreground mt-0.5">{teacher?.soDienThoai || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5" /> Đơn vị đào tạo
              </span>
              <p className="font-medium text-foreground mt-0.5">{teacher?.tenKhoa || "Khoa Công nghệ thông tin"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Lịch sử các học phần phụ trách */}
        <Card className="md:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Các học phần được phân công</CardTitle>
            <CardDescription className="text-xs">Danh sách môn học và lớp sinh viên trong hệ thống.</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chưa có phân công giảng dạy.</p>
            ) : (
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Môn học</TableHead>
                      <TableHead>Lớp</TableHead>
                      <TableHead className="text-center">Kỳ</TableHead>
                      <TableHead className="text-center">Sĩ số</TableHead>
                      {onNavigateToGradebook && <TableHead className="text-right">Sổ điểm</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((item) => (
                      <TableRow key={item.maPC || `${item.maMH}-${item.maLop}`}>
                        <TableCell>
                          <div className="font-medium text-sm">{item.tenMH || item.maMH}</div>
                          <div className="font-mono text-xs text-muted-foreground">{item.maMH}</div>
                        </TableCell>
                        <TableCell className="text-sm">{item.tenLop || item.maLop}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs font-mono">{item.maHK}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs font-semibold">{item.siSo || 0} SV</TableCell>
                        {onNavigateToGradebook && (
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onNavigateToGradebook(item.maLop, item.maMH, item.maHK)}
                              className="text-xs text-primary"
                            >
                              Vào điểm
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
