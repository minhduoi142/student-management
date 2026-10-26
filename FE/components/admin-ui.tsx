import type { ReactNode } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function RequestBadge({ children }: { children: ReactNode }) {
  return (
    <Badge variant="outline" className="h-auto rounded-md px-2 py-1 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </Badge>
  )
}

export function InitialAvatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("vi-VN")

  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials || "SV"}</AvatarFallback>
    </Avatar>
  )
}

export function Pagination({
  pageNo,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
}: {
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const firstItem = totalElements === 0 ? 0 : (pageNo - 1) * pageSize + 1
  const lastItem = Math.min(pageNo * pageSize, totalElements)

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{firstItem}–{lastItem}</span> trong <span className="font-medium text-foreground">{totalElements}</span> bản ghi
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageNo <= 1}
          onClick={() => onPageChange(pageNo - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft data-icon="inline-start" />
          Trước
        </Button>
        <span className="min-w-20 text-center text-xs text-muted-foreground">Trang {pageNo} / {Math.max(totalPages, 1)}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageNo >= totalPages || totalPages === 0}
          onClick={() => onPageChange(pageNo + 1)}
          aria-label="Trang tiếp theo"
        >
          Sau
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

