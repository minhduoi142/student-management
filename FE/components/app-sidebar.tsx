"use client"

import { GraduationCap, PanelLeftClose, PanelLeftOpen, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { navigationGroups } from "@/components/app-navigation"
import { cn } from "cn"

export function AppSidebar({
  activePath,
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onNavigate,
}: {
  activePath: string
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onNavigate: (href: string) => void
}) {
  return (
    <aside
      aria-label="Điều hướng chính"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-dvh w-[272px] shrink-0 flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed && "lg:w-[82px]", 
      )}
    >
      <div className={cn("flex h-[76px] shrink-0 items-center gap-3 border-b border-sidebar-border px-5", collapsed && "lg:justify-center lg:px-0")}>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <GraduationCap className="size-5" aria-hidden="true" />
        </div>
        <div className={cn("min-w-0 flex-1 transition-opacity", collapsed && "lg:hidden")}>
          <p className="truncate text-sm font-semibold tracking-wide">Học vụ số</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/55">Academic workspace</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Các phân hệ">
        <div className="flex flex-col gap-6">
          {navigationGroups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <p className={cn("mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45", collapsed && "lg:sr-only")}>
                {group.label}
              </p>
              <div className="grid gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activePath === item.href || (item.href === "/" && activePath === "/dashboard")
                  return (
                    <Button
                      key={item.href}
                      type="button"
                      variant="ghost"
                      aria-current={isActive ? "page" : undefined}
                      aria-label={item.label}
                      title={collapsed ? item.label : undefined}
                      onClick={() => onNavigate(item.href)}
                      className={cn(
                        "h-10 w-full justify-start gap-3 rounded-xl px-3 text-left text-sm font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:px-3",
                        collapsed && "lg:justify-center lg:px-0",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm hover:bg-sidebar-accent",
                      )}
                    >
                      <Icon data-icon="inline-start" />
                      <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                      {isActive && !collapsed ? <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" aria-hidden="true" /> : null}
                    </Button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="shrink-0 px-3 pb-4">
        <div className={cn("rounded-xl border border-sidebar-border bg-sidebar-accent/70 p-3", collapsed && "lg:hidden")}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Năm học 2024–2025</p>
              <p className="mt-1 text-[11px] text-sidebar-foreground/60">Học kỳ 1 · Đang diễn ra</p>
            </div>
            <span className="size-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.12)]" aria-label="Đang hoạt động" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3 h-8 w-full justify-start gap-2 rounded-lg px-2 text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => onNavigate("/hoc-ky")}
          >
            <Settings2 data-icon="inline-start" />
            Cấu hình học kỳ
          </Button>
        </div>
        <Separator className="my-3 bg-sidebar-border" />
        <div className={cn("flex items-center gap-3 rounded-xl px-2 py-1.5", collapsed && "lg:justify-center") }>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">PT</div>
          <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
            <p className="truncate text-xs font-semibold">Hệ thống đào tạo</p>
            <p className="truncate text-[10px] text-sidebar-foreground/55">Quản trị viên</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
