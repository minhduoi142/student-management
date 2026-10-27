"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  Search,
  Settings2,
  Shield,
  Sun,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { navigationItems } from "@/components/app-navigation"
import { authService, type LoginResponse } from "@/services"

export function AppHeader({
  activePath,
  onOpenMobileNav,
  onToggleSidebar,
}: {
  activePath: string
  onOpenMobileNav: () => void
  onToggleSidebar: () => void
}) {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null)
  const currentPage = navigationItems.find((item) => item.href === activePath) ?? navigationItems[0]

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser())
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN")
    if (!normalizedQuery) return navigationItems
    return navigationItems.filter((item) => `${item.label} ${item.description}`.toLocaleLowerCase("vi-VN").includes(normalizedQuery))
  }, [query])

  const navigateTo = (href: string) => {
    setSearchOpen(false)
    setQuery("")
    router.push(href)
  }

  const handleLogout = () => {
    authService.logout()
    toast.success("Đã đăng xuất thành công.")
    router.replace("/login")
  }

  const roleLabel = useMemo(() => {
    switch (currentUser?.role) {
      case "ADMIN":
        return "Quản trị viên"
      case "GIANGVIEN":
        return "Giảng viên"
      case "SINHVIEN":
        return "Sinh viên"
      default:
        return currentUser?.role || "Quản trị viên"
    }
  }, [currentUser?.role])

  const userDisplayName = currentUser?.username || "Admin"
  const avatarInitials = (userDisplayName.length >= 2 ? userDisplayName.slice(0, 2) : "AD").toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-xl md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onOpenMobileNav} aria-label="Mở điều hướng">
            <Menu />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="hidden shrink-0 lg:inline-flex" onClick={onToggleSidebar} aria-label="Thu gọn hoặc mở rộng điều hướng">
            <PanelLeftClose />
          </Button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex" aria-label="Đường dẫn hiện tại">
            <span>Học vụ</span>
            <ChevronRight aria-hidden="true" />
            <span className="font-medium text-foreground">{currentPage.label}</span>
          </div>
          <div className="min-w-0 sm:hidden">
            <p className="truncate text-sm font-semibold">{currentPage.label}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button type="button" variant="outline" className="hidden h-9 w-[210px] justify-between gap-3 px-3 text-muted-foreground md:flex lg:w-[250px]" onClick={() => setSearchOpen(true)}>
            <span className="flex items-center gap-2"><Search data-icon="inline-start" />Tìm kiếm phân hệ</span>
            <span className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Ctrl K</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm phân hệ">
            <Search />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            title={theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="relative" aria-label="Thông báo" onClick={() => toast.info("Hệ thống kết nối trực tiếp cơ sở dữ liệu học vụ.")}>
            <Bell />
            <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-background bg-sky-500" aria-hidden="true" />
          </Button>
          <div className="mx-1 hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button type="button" variant="ghost" className="h-10 gap-2 rounded-xl px-1.5 sm:px-2" aria-label="Mở menu tài khoản" />}>
              <Avatar className="size-8"><AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{avatarInitials}</AvatarFallback></Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold leading-4">{userDisplayName}</span>
                <span className="block text-[10px] leading-4 text-muted-foreground">{roleLabel}</span>
              </span>
              <ChevronDown className="hidden text-muted-foreground sm:block" data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <span className="block text-sm font-medium">{userDisplayName}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Vai trò: <span className="font-semibold text-foreground">{roleLabel}</span></span>
                {currentUser?.maSV && <span className="block text-xs text-muted-foreground">Mã SV: {currentUser.maSV}</span>}
                {currentUser?.maGV && <span className="block text-xs text-muted-foreground">Mã GV: {currentUser.maGV}</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigateTo("/hoc-ky")}>
                <Settings2 data-icon="inline-start" />Cấu hình học vụ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut data-icon="inline-start" />Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>Tìm kiếm phân hệ</DialogTitle>
            <DialogDescription>Chọn một mục để chuyển nhanh trong hệ thống.</DialogDescription>
          </DialogHeader>
          <div className="border-b px-4 py-3">
            <label htmlFor="workspace-search" className="sr-only">Tìm kiếm trang</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="workspace-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sinh viên, điểm, danh mục..." className="h-10 border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0" />
            </div>
          </div>
          <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            {filteredRoutes.length ? filteredRoutes.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.href} type="button" onClick={() => navigateTo(item.href)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                  </span>
                  <ChevronRight className="shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              )
            }) : (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Không tìm thấy phân hệ phù hợp.</p>
            )}
          </div>
          <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-2.5 text-[11px] text-muted-foreground">
            <span>Điều hướng học vụ</span>
            <span>Nhấn Esc để đóng</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
