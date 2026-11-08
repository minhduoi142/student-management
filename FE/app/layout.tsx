import "@/lib/crypto-polyfill"
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && (!window.crypto || typeof window.crypto.randomUUID !== 'function')) {
                if (!window.crypto) window.crypto = {};
                window.crypto.randomUUID = function() {
                  if (typeof window.crypto.getRandomValues === 'function') {
                    var bytes = new Uint8Array(16);
                    window.crypto.getRandomValues(bytes);
                    bytes[6] = (bytes[6] & 0x0f) | 0x40;
                    bytes[8] = (bytes[8] & 0x3f) | 0x80;
                    var hex = Array.from(bytes, function(b) { return b.toString(16).padStart(2, '0'); }).join('');
                    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20, 32);
                  }
                  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = (Math.random() * 16) | 0;
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                  });
                };
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
