"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { AcademicDataProvider } from "@/components/academic-data-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AcademicDataProvider>
        <TooltipProvider delay={150}>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </AcademicDataProvider>
    </ThemeProvider>
  )
}
