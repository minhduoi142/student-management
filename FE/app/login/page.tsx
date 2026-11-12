"use client"

import { Suspense, useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Shield,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService, type LoginResponse } from "@/services"
import { getErrorMessage } from "@/lib/api-client"

const demoAccounts = [
  {
    role: "Quản trị viên",
    code: "ADMIN",
    user: "admin",
    pass: "admin123",
    color: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 hover:bg-rose-500/20",
    icon: ShieldCheck,
  },
  {
    role: "Giảng viên",
    code: "GIANGVIEN",
    user: "gv01",
    pass: "123456",
    color: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20 hover:bg-sky-500/20",
    icon: UserCheck,
  },
  {
    role: "Sinh viên",
    code: "SINHVIEN",
    user: "b24dcce001",
    pass: "123456",
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20",
    icon: GraduationCap,
  },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isForcedLogout = searchParams.get("logout") === "true"

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [existingUser, setExistingUser] = useState<LoginResponse | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const error = searchParams.get("error")
    const message = searchParams.get("message")
    if (error) {
      toast.error(message || "Đăng nhập Google thất bại hoặc phiên đã kết thúc.")
    }

    if (isForcedLogout) {
      authService.logout()
      setExistingUser(null)
      setCheckingAuth(false)
      return
    }

    const token = authService.getCurrentToken()
    const user = authService.getCurrentUser()

    if (token && user) {
      setExistingUser(user)
    }
    setCheckingAuth(false)
  }, [isForcedLogout, searchParams])

  const handleGoogleLogin = () => {
    window.location.href = "/oauth2/authorization/google"
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedUser = username.trim()
    if (!trimmedUser) {
      toast.error("Vui lòng nhập tên đăng nhập.")
      return
    }
    if (!password) {
      toast.error("Vui lòng nhập mật khẩu.")
      return
    }

    setLoading(true)
    try {
      const res = await authService.login({
        username: trimmedUser,
        password,
      })

      const roleDisplay =
        res.role === "ADMIN" ? "Quản trị viên" : res.role === "GIANGVIEN" ? "Giảng viên" : "Sinh viên"
      toast.success(`Đăng nhập thành công! Xin chào ${res.username} (${roleDisplay}).`)
      router.push("/")
    } catch (err) {
      toast.error(getErrorMessage(err, "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu."))
    } finally {
      setLoading(false)
    }
  }

  const handleUseDemo = (u: string, p: string) => {
    setUsername(u)
    setPassword(p)
  }

  const handleSwitchAccount = () => {
    authService.logout()
    setExistingUser(null)
    toast.info("Đã đăng xuất phiên trước. Vui lòng đăng nhập tài khoản mới.")
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo & Tiêu đề hệ thống */}
        <div className="text-center space-y-2">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <GraduationCap className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Học vụ số • PTIT
          </h1>
          <p className="text-sm text-muted-foreground">
            Hệ thống Quản lý Đào tạo Đại học theo Học chế Tín chỉ
          </p>
        </div>

        {/* Thông báo nếu đã có phiên trước đó */}
        {existingUser && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phiên làm việc hiện tại:</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {existingUser.username} ({existingUser.role})
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" onClick={() => router.push("/")} className="h-8 text-xs">
                  Vào hệ thống
                </Button>
                <Button size="sm" variant="outline" onClick={handleSwitchAccount} className="h-8 text-xs gap-1">
                  <LogOut className="size-3.5" />
                  Đổi nick
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Đăng nhập */}
        <Card className="border-border/60 shadow-xl backdrop-blur-xl bg-card/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Đăng nhập tài khoản</CardTitle>
            <CardDescription className="text-xs">
              Nhập thông tin tài khoản được cấp để truy cập phân hệ tương ứng.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {/* Tên đăng nhập */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-semibold">
                  Tên đăng nhập / Mã định danh
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="admin, mã giảng viên hoặc mã SV..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 h-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Mật khẩu
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              {/* Nút Đăng nhập */}
              <Button type="submit" className="w-full h-10 text-sm font-semibold gap-2 shadow-sm" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                {loading ? "Đang xác thực..." : "Đăng nhập vào hệ thống"}
              </Button>

              {/* Phân cách Hoặc */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-border w-full" />
                <span className="bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Hoặc
                </span>
              </div>

              {/* Nút Đăng nhập với Google */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-10 text-sm font-semibold gap-2 border-border/80 hover:bg-muted/50 transition-colors shadow-xs"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập bằng Google</span>
              </Button>

              {/* Tài khoản mẫu 1-Click */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="border-t border-border w-full" />
                  <span className="bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Chọn nhanh tài khoản mẫu
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {demoAccounts.map((acc) => {
                    const Icon = acc.icon
                    const isSelected = username === acc.user
                    return (
                      <button
                        key={acc.code}
                        type="button"
                        onClick={() => handleUseDemo(acc.user, acc.pass)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                          isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : acc.color
                        }`}
                      >
                        <Icon className="size-4" />
                        <span className="text-[11px] font-semibold leading-tight">{acc.role}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{acc.user}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col gap-2 border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
            <span>Kết nối trực tiếp Spring Boot Security (JWT Stateless & Contextual Auth)</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
