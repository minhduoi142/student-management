"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService, fileService, studentService, type SinhVienResponse } from "@/services"

export function StudentProfileView({
  maSV,
  onNavigateToGrades,
}: {
  maSV?: string
  onNavigateToGrades?: () => void
}) {
  const currentUser = authService.getCurrentUser()
  const effectiveMaSV = maSV || currentUser?.maSV || "B24DCCE001"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [profile, setProfile] = useState<SinhVienResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form fields cho phép cập nhật (Ứng với Câu 11)
  const [soDienThoai, setSoDienThoai] = useState("")
  const [email, setEmail] = useState("")
  const [diaChi, setDiaChi] = useState("")

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await studentService.getStudentById(effectiveMaSV)
      setProfile(data)
      setSoDienThoai(data.soDienThoai || "")
      setEmail(data.email || "")
      setDiaChi(data.diaChi || "")
      if (data?.avatarUrl) {
        authService.updateCurrentUserAvatar(data.avatarUrl)
      }
    } catch {
      toast.error("Không thể tải thông tin hồ sơ sinh viên.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [effectiveMaSV])

  // Lắng nghe sự kiện cập nhật avatar từ Header hoặc Dialog
  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>
      setProfile((prev) => (prev ? { ...prev, avatarUrl: customEvent.detail || undefined } : null))
    }
    window.addEventListener("user-avatar-updated", handleAvatarUpdate)
    return () => window.removeEventListener("user-avatar-updated", handleAvatarUpdate)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const phoneTrimmed = soDienThoai.trim()
    const emailTrimmed = email.trim()
    const addressTrimmed = diaChi.trim()

    if (!phoneTrimmed || !/^\d{10}$/.test(phoneTrimmed)) {
      toast.error("Số điện thoại phải gồm đúng 10 chữ số.")
      return
    }

    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ.")
      return
    }

    if (!addressTrimmed) {
      toast.error("Địa chỉ liên hệ không được để trống.")
      return
    }

    setSaving(true)
    try {
      const updated = await studentService.updateProfile(effectiveMaSV, {
        soDienThoai: phoneTrimmed,
        email: emailTrimmed,
        diaChi: addressTrimmed,
      })
      setProfile(updated)
      toast.success("Cập nhật thông tin liên hệ sinh viên thành công!")
    } catch {
      toast.error("Cập nhật thông tin thất bại. Vui lòng kiểm tra lại.")
    } finally {
      setSaving(false)
    }
  }

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
      setProfile((prev) => (prev ? { ...prev, avatarUrl: res.avatarUrl } : null))
      toast.success("Cập nhật ảnh thẻ sinh viên thành công!")
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
      setProfile((prev) => (prev ? { ...prev, avatarUrl: undefined } : null))
      toast.success("Đã xóa ảnh thẻ sinh viên, chuyển về avatar chữ cái.")
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
        <p className="text-sm text-muted-foreground">Đang tải hồ sơ sinh viên...</p>
      </div>
    )
  }

  const currentAvatarUrl =
    profile?.avatarUrl || (currentUser?.maSV === effectiveMaSV ? currentUser?.avatarUrl : undefined)

  const initials = profile?.hoTen
    ? profile.hoTen
        .split(" ")
        .map((p) => p[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "SV"

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Hồ sơ Sinh viên & Thông tin Liên hệ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem thông tin định danh sinh viên và cập nhật thông tin liên lạc cá nhân theo quy định đào tạo.
        </p>
      </div>

      {/* Thẻ sinh viên điện tử (Student E-Card) */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-sky-500/10 p-6 shadow-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="size-20 border-2 border-primary/30 shadow-inner">
                {currentAvatarUrl && (
                  <AvatarImage src={currentAvatarUrl} alt={profile?.hoTen} />
                )}
                <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 border-2 border-background cursor-pointer"
                title="Thay đổi ảnh thẻ sinh viên"
                aria-label="Thay đổi ảnh thẻ sinh viên"
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
                <h2 className="text-xl font-bold text-foreground">{profile?.hoTen || effectiveMaSV}</h2>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {profile?.trangThai === "DANG_HOC" ? "Đang học" : profile?.trangThai || "Đang học"}
                </Badge>
              </div>
              <p className="font-mono text-sm font-semibold text-muted-foreground mt-0.5">
                Mã SV: <span className="text-foreground">{effectiveMaSV}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span>Lớp: <strong className="text-foreground">{profile?.tenLop || profile?.maLop}</strong></span>
                <span>•</span>
                <span>Khoa: <strong className="text-foreground">{profile?.tenKhoa || "CNTT"}</strong></span>
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
                    Xóa ảnh thẻ
                  </Button>
                </div>
              )}
            </div>
          </div>

          {onNavigateToGrades && (
            <Button type="button" onClick={onNavigateToGrades} variant="outline" className="gap-2 shrink-0">
              <GraduationCap className="size-4" />
              Xem bảng điểm
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột 1: Thông tin cố định do nhà trường quản lý */}
        <Card className="md:col-span-1 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Thông tin cố định</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Các thông tin định danh học vụ chỉ được điều chỉnh bởi Phòng Đào tạo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Mã sinh viên</span>
              <p className="font-mono font-semibold text-foreground">{profile?.maSV}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Họ và tên</span>
              <p className="font-semibold text-foreground">{profile?.hoTen}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Ngày sinh</span>
              <p className="font-medium text-foreground">{profile?.ngaySinh || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Giới tính</span>
              <p className="font-medium text-foreground">{profile?.gioiTinh || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Lớp sinh hoạt</span>
              <p className="font-medium text-foreground">{profile?.tenLop || profile?.maLop}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Khoa chủ quản</span>
              <p className="font-medium text-foreground">{profile?.tenKhoa || "Công nghệ thông tin"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Cột 2 & 3: Form cập nhật thông tin liên hệ (Câu 11) */}
        <Card className="md:col-span-2 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <CardTitle className="text-base font-semibold">Cập nhật thông tin liên hệ (Câu 11)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Sinh viên được phép tự cập nhật số điện thoại, email cá nhân và địa chỉ thường trú để nhà trường liên lạc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="soDienThoai" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Phone className="size-3.5 text-primary" />
                  Số điện thoại di động <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="soDienThoai"
                  type="tel"
                  placeholder="0912345678"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  maxLength={10}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-[11px] text-muted-foreground">Định dạng 10 chữ số dùng để nhận OTP và thông báo học vụ.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold">
                  <Mail className="size-3.5 text-primary" />
                  Địa chỉ Email cá nhân <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sinhvien@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm"
                  required
                />
                <p className="text-[11px] text-muted-foreground">Hòm thư dùng để nhận bảng điểm và thông báo thi cử.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diaChi" className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPin className="size-3.5 text-primary" />
                  Địa chỉ thường trú / Tạm trú <span className="text-rose-500">*</span>
                </Label>
                <textarea
                  id="diaChi"
                  rows={3}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Lưu thay đổi hồ sơ
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
