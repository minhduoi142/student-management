"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
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
import { authService } from "@/services"
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

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Nếu đã đăng nhập trước đó thì tự động chuyển hướng về trang chủ
  useEffect(() => {
    const token = authService.getCurrentToken()
    if (token) {
      router.replace("/")
    } else {
      setCheckingAuth(false)
    }
  }, [router])

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

      toast.success(`Đăng nhập thành công! Xin chào ${res.username} (${res.role}).`)
      router.push("/")
    } catch (err) {
      toast.error(getErrorMessage(err, "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu."))
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (user: string, pass: string, roleName: string) => {
    setUsername(user)
    setPassword(pass)
    toast.info(`Đã nạp tài khoản mẫu: ${roleName} (${user})`)
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span>Đang kiểm tra phiên đăng nhập...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative gradient background elements */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-300">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <GraduationCap className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Quản Lý Sinh Viên
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hệ thống đào tạo & quản trị học vụ — Nhóm 6 CE02
          </p>
        </div>

        <Card className="border-border/60 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Đăng nhập hệ thống</CardTitle>
              <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                <Shield className="size-3 text-emerald-500" />
                JWT Auth
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Nhập tên tài khoản và mật khẩu đã được cấp để tiếp tục
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-medium">
                  Tên đăng nhập
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="admin, gv01 hoặc mã SV..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    className="pl-9 text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Mật khẩu
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-9 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Accounts Preset Chips */}
              <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <KeyRound className="size-3.5" />
                  Nạp nhanh tài khoản mẫu:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {demoAccounts.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => fillCredentials(item.user, item.pass, item.role)}
                        disabled={loading}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${item.color}`}
                      >
                        <Icon className="size-3" />
                        <span>{item.role}</span>
                        <span className="opacity-70">({item.user})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button type="submit" className="w-full gap-2 font-medium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    <span>Đăng nhập</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Kết nối trực tiếp Spring Boot 3 Backend tại{" "}
          <span className="font-mono text-foreground">http://localhost:8081/api/v1</span>
        </p>
      </div>
    </div>
  )
}
