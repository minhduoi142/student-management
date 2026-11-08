// Polyfill cho crypto.randomUUID khi chạy trên HTTP (non-secure context)
// Web Cryptography API chuẩn (crypto.randomUUID) chỉ khả dụng trên HTTPS hoặc localhost.
// Khi deploy lên VPS qua IP/HTTP thông thường, window.crypto.randomUUID sẽ bị undefined.

if (typeof window !== "undefined") {
  if (!window.crypto) {
    // @ts-ignore
    window.crypto = {}
  }

  if (typeof window.crypto.randomUUID !== "function") {
    window.crypto.randomUUID = function randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
      // Thuật toán chuẩn RFC4122 v4
      if (typeof window.crypto.getRandomValues === "function") {
        const bytes = new Uint8Array(16)
        window.crypto.getRandomValues(bytes)
        bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10xx
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}` as any
      }

      // Fallback bằng Math.random nếu getRandomValues cũng không có
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }) as any
    }
  }
}

