"use client"

import { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  Camera,
  Database,
  FileSpreadsheet,
  GraduationCap,
  HardDrive,
  Landmark,
  Layers3,
  Loader2,
  Lock,
  Server,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  UserCheck,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService, fileService, type LoginResponse } from "@/services"

export function AdminProfileView({
  onNavigate,
}: {
  onNavigate?: (href: string) => void
}) {
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser())

    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>
      setCurrentUser((prev) => (prev ? { ...prev, avatarUrl: customEvent.detail || undefined } : null))
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
      setCurrentUser((prev) => (prev ? { ...prev, avatarUrl: res.avatarUrl } : null))
      authService.updateCurrentUserAvatar(res.avatarUrl)
      toast.success("Cập nhật ảnh đại diện Quản trị viên thành công!")
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
      setCurrentUser((prev) => (prev ? { ...prev, avatarUrl: undefined } : null))
      authService.updateCurrentUserAvatar(null)
      toast.success("Đã xóa ảnh đại diện, chuyển về avatar mặc định.")
    } catch {
      toast.error("Không thể xóa ảnh đại diện. Vui lòng thử lại.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const username = currentUser?.username || "admin"
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Hồ sơ Quản trị viên & Tài khoản Hệ thống
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý định danh tài khoản Quản trị đào tạo, ảnh đại diện và giám sát cấu hình bảo mật.
        </p>
      </div>

      {/* Thẻ định danh Quản trị viên */}
      <Card className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-background to-primary/10 p-6 shadow-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="size-24 border-2 border-purple-500/30 shadow-inner">
                {currentUser?.avatarUrl && (
                  <AvatarImage src={currentUser.avatarUrl} alt={username} />
                )}
                <AvatarFallback className="bg-purple-600 text-2xl font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-transform active:scale-95 border-2 border-background cursor-pointer"
                title="Thay đổi ảnh đại diện"
                aria-label="Thay đổi ảnh đại diện"
              >
                {uploadingAvatar ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
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
                <h2 className="text-xl font-bold text-foreground">Quản trị viên Hệ thống</h2>
                <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30">
                  ADMINISTRATOR
                </Badge>
              </div>
              <p className="font-mono text-sm font-semibold text-muted-foreground mt-0.5">
                Tài khoản: <span className="text-foreground">{username}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Đang hoạt động
                </span>
                <span>•</span>
                <span>Phạm vi: <strong>Toàn bộ hệ thống đào tạo</strong></span>
              </p>

              {currentUser?.avatarUrl && (
                <div className="mt-2.5 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingAvatar}
                    onClick={handleAvatarDelete}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                    Xóa ảnh đại diện
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="size-4" />
              Tải ảnh mới
            </Button>
          </div>
        </div>
      </Card>

      {/* Thông số kỹ thuật & An toàn tài khoản */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-purple-600 dark:text-purple-400" />
              Thông tin Tài khoản & Bảo mật
            </CardTitle>
            <CardDescription className="text-xs">Chi tiết phiên làm việc và phương thức xác thực.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Tên đăng nhập:</span>
              <span className="font-mono font-medium text-foreground">{username}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Vai trò hệ thống:</span>
              <Badge variant="outline" className="font-mono font-semibold">ROLE_ADMIN</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Phương thức xác thực:</span>
              <span className="text-xs font-mono text-foreground">JWT HMAC-SHA256</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Thời hạn Token:</span>
              <span className="text-xs text-foreground">24 giờ (tự động làm mới)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Quyền hạn:</span>
              <span className="text-xs text-right font-medium text-foreground">
                Quản lý Sinh viên, Điểm, Lớp, Khoa, Môn học, Thống kê
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="size-4 text-sky-600 dark:text-sky-400" />
              Hạ tầng Lưu trữ & Backend API
            </CardTitle>
            <CardDescription className="text-xs">Thông số kết nối Spring Boot và MinIO Object Storage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Lưu trữ ảnh Avatar:</span>
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                <HardDrive className="size-3.5 text-sky-500" />
                MinIO S3 Compatible
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Bucket đại diện:</span>
              <span className="font-mono text-xs text-foreground">qlsv-avatars</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Backend API:</span>
              <span className="font-mono text-xs text-foreground">http://localhost:8081/api/v1</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <span className="text-muted-foreground">Chính sách Bucket:</span>
              <Badge variant="secondary" className="text-[10px]">Public-Read</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Kích thước tệp tối đa:</span>
              <span className="text-xs font-medium text-foreground">5.0 MB (JPG, PNG, WEBP, GIF)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lối tắt quản trị nhanh */}
      {onNavigate && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Lối tắt phân hệ chức năng</CardTitle>
            <CardDescription className="text-xs">Truy cập nhanh các nghiệp vụ quản lý đào tạo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("/sinh-vien")}
                className="h-auto flex-col items-center justify-center p-3 gap-2"
              >
                <UsersRound className="size-5 text-primary" />
                <span className="text-xs font-medium">Hồ sơ Sinh viên</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("/diem")}
                className="h-auto flex-col items-center justify-center p-3 gap-2"
              >
                <FileSpreadsheet className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium">Quản lý Điểm</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("/khoa")}
                className="h-auto flex-col items-center justify-center p-3 gap-2"
              >
                <Landmark className="size-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium">Danh mục Khoa</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("/lop")}
                className="h-auto flex-col items-center justify-center p-3 gap-2"
              >
                <Layers3 className="size-5 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-medium">Lớp sinh viên</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
