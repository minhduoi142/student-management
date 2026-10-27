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

/**
 * Cập nhật hoặc xóa token xác thực hiện tại trong bộ nhớ và localStorage
 */
export function setAuthToken(token: string | null) {
  cachedToken = token
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("access_token", token)
      localStorage.setItem("qlsv_token", token)
    } else {
      localStorage.removeItem("access_token")
      localStorage.removeItem("qlsv_token")
      localStorage.removeItem("auth_user")
    }
  }
}

/**
 * Lấy token xác thực của người dùng hiện tại (ưu tiên phiên đăng nhập trong localStorage)
 */
export function getActiveToken(): string | null {
  if (typeof window !== "undefined") {
    const userToken = localStorage.getItem("access_token") || localStorage.getItem("qlsv_token")
    if (userToken) {
      cachedToken = userToken
      return userToken
    }
  }
  return cachedToken
}

// Fallback tự động đăng nhập tài khoản quản trị khi chưa có phiên đăng nhập của người dùng
async function getFallbackAdminToken(): Promise<string | null> {
  const currentToken = getActiveToken()
  if (currentToken) return currentToken

  if (isLoggingIn && loginPromise) {
    return loginPromise
  }

  isLoggingIn = true
  loginPromise = (async () => {
    try {
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
      // Bỏ qua nếu backend không yêu cầu xác thực hoặc đăng nhập dự phòng lỗi
    } finally {
      isLoggingIn = false
    }
    return null
  })()

  return loginPromise
}

// Request interceptor: Gắn Bearer Token vào header (ƯU TIÊN token của tài khoản đang đăng nhập)
apiClient.interceptors.request.use(async (config) => {
  let token = getActiveToken()
  if (!token) {
    token = await getFallbackAdminToken()
  }
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
    // If 401 Unauthorized, clear cached and stored tokens
    if (error.response?.status === 401) {
      setAuthToken(null)
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
