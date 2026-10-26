"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { CatalogView } from "@/components/catalog-view"
import { DashboardView } from "@/components/dashboard-view"
import { GradesView } from "@/components/grades-view"
import { StudentsView } from "@/components/students-view"

const catalogRoutes = new Set(["/lop", "/khoa", "/mon-hoc", "/giang-vien", "/hoc-ky"])

export function AdminWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const activePath = pathname === "/dashboard" ? "/" : pathname

  const navigateTo = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  const renderView = () => {
    if (activePath === "/sinh-vien") return <StudentsView />
    if (activePath === "/diem") return <GradesView />
    if (catalogRoutes.has(activePath)) return <CatalogView resource={activePath.slice(1) as "lop" | "khoa" | "mon-hoc" | "giang-vien" | "hoc-ky"} />
    return <DashboardView />
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only z-50 rounded-md bg-background px-4 py-2 text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring">Bỏ qua điều hướng</a>
      {mobileNavOpen ? (
        <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Đóng điều hướng" onClick={() => setMobileNavOpen(false)} />
      ) : null}
      <AppSidebar
        activePath={activePath}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        onNavigate={navigateTo}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader
          activePath={activePath}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
        />
        <main id="main-content" className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 md:px-6 md:py-7 lg:px-8" tabIndex={-1}>
          {renderView()}
        </main>
        <footer className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 border-t px-4 py-4 text-[11px] text-muted-foreground md:px-6 lg:px-8">
          <span>© 2026 · Hệ thống quản trị đào tạo</span>
          <span className="hidden sm:inline">Kết nối trực tiếp Spring Boot Backend API (http://localhost:8081/api/v1)</span>
        </footer>
      </div>
    </div>
  )
}
