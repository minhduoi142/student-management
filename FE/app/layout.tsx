import { Analytics } from "@vercel/analytics/next"
import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Providers } from "@/app/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Học vụ số | Quản trị đào tạo",
    template: "%s | Học vụ số",
  },
  description: "Nền tảng quản trị học vụ cho hồ sơ sinh viên, điểm học phần và danh mục đào tạo.",
  applicationName: "Học vụ số",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Học vụ số | Quản trị đào tạo",
    description: "Quản lý sinh viên, điểm học phần và danh mục đào tạo trên một nền tảng.",
    locale: "vi_VN",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#171b27" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
