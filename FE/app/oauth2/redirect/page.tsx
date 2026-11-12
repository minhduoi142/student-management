"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { setStoredToken } from "@/lib/api-client"
import type { LoginResponse, RoleEnum } from "@/services/types"

function OAuth2RedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")
    const message = searchParams.get("message")

    if (error) {
      const errorMsg = message || "Đăng nhập Google thất bại hoặc bị hủy."
      toast.error(errorMsg)
      router.replace("/login")
      return
    }

    if (token) {
      const username = searchParams.get("username") || "user"
      const role = (searchParams.get("role") || "SINHVIEN") as RoleEnum
      const maSV = searchParams.get("maSV") || undefined
      const maGV = searchParams.get("maGV") || undefined

      const authData: LoginResponse = {
        accessToken: token,
        tokenType: "Bearer",
        username,
        role,
        maSV: maSV || undefined,
        maGV: maGV || undefined,
      }

      setStoredToken(token)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(authData))
      }

      const roleDisplay =
        role === "ADMIN" ? "Quản trị viên" : role === "GIANGVIEN" ? "Giảng viên" : "Sinh viên"

      toast.success(`Đăng nhập Google thành công! Xin chào ${username} (${roleDisplay}).`)
      router.replace("/")
      return
    }

    // Nếu không có token và không có error, đưa về login
    router.replace("/login")
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Đang xử lý phiên xác thực Google OAuth2...
      </p>
    </div>
  )
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuth2RedirectHandler />
    </Suspense>
  )
}

