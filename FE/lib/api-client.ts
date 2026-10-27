import axios, { AxiosError, AxiosResponse } from "axios"

export interface ApiResponseEnvelope<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api/v1" : "http://localhost:8081/api/v1")

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
})

let cachedToken: string | null = null
let isLoggingIn = false
let loginPromise: Promise<string | null> | null = null

// Helper to auto-login as admin (admin / admin123) if Spring Boot security requires JWT
async function getAdminToken(): Promise<string | null> {
  if (cachedToken) return cachedToken
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("qlsv_token")
    if (stored) {
      cachedToken = stored
      return stored
    }
  }

  if (isLoggingIn && loginPromise) {
    return loginPromise
  }

  isLoggingIn = true
  loginPromise = (async () => {
    try {
      // Use direct URL or relative /api/v1/auth/login
      const targetUrl =
        typeof window !== "undefined"
          ? "/api/v1/auth/login"
          : "http://localhost:8081/api/v1/auth/login"

      const res = await axios.post(
        targetUrl,
        { username: "admin", password: "admin123" },
        { timeout: 4000 }
      )
      const token = res.data?.data?.accessToken || res.data?.data?.token
      if (token) {
        cachedToken = token
        if (typeof window !== "undefined") {
          localStorage.setItem("qlsv_token", token)
        }
        return token
      }
    } catch {
      // Ignore if backend doesn't require auth or login fails
    } finally {
      isLoggingIn = false
    }
    return null
  })()

  return loginPromise
}

// Request interceptor: attach Bearer token if available
apiClient.interceptors.request.use(async (config) => {
  const token = await getAdminToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: automatically extract `data` from `{ success, message, data, timestamp }`
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const resBody = response.data

    if (resBody && typeof resBody === "object" && "data" in resBody) {
      const extracted = resBody.data
      const message = resBody.message

      if (extracted === null || extracted === undefined) {
        return { _message: message, success: resBody.success ?? true }
      }

      if (typeof extracted === "object" && !Array.isArray(extracted)) {
        try {
          Object.defineProperty(extracted, "_message", {
            value: message,
            enumerable: false,
            writable: true,
          })
        } catch {
          ;(extracted as any)._message = message
        }
      }

      return extracted
    }

    return resBody
  },
  async (error: AxiosError<any>) => {
    // If 401 Unauthorized, clear cached token so next request re-authenticates
    if (error.response?.status === 401) {
      cachedToken = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("qlsv_token")
      }
    }

    const errorData = error.response?.data
    let backendMessage =
      errorData?.message ||
      (typeof errorData === "string" ? errorData : null)

    if (!backendMessage) {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        backendMessage =
          "Không thể kết nối đến máy chủ Backend (http://localhost:8081). Vui lòng đảm bảo ứng dụng Spring Boot đang chạy."
      } else {
        backendMessage = error.message || "Đã có lỗi xảy ra khi kết nối tới máy chủ"
      }
    }

    return Promise.reject(new Error(backendMessage))
  }
)

export function getErrorMessage(error: unknown, fallback = "Thao tác thất bại"): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return fallback
}

export function getSuccessMessage(response: any, fallback = "Thao tác thành công"): string {
  if (response && typeof response === "object" && "_message" in response && response._message) {
    return response._message
  }
  return fallback
}

export default apiClient
