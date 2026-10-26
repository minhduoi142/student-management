import axios, { AxiosError, AxiosResponse } from "axios"

export interface ApiResponseEnvelope<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

// In the browser, use "/api/v1" so Next.js rewrites proxy to backend to avoid any CORS issues,
// or fallback to direct URL http://localhost:8081/api/v1 if environment variable is set.
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

// Response interceptor: automatically extract `data` from `{ success, message, data, timestamp }`
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const resBody = response.data

    // Check if the response follows the backend envelope format
    if (resBody && typeof resBody === "object" && "data" in resBody) {
      const extracted = resBody.data
      const message = resBody.message

      // If data is null or undefined (e.g. ApiResponse<Void>), return an object with _message
      if (extracted === null || extracted === undefined) {
        return { _message: message, success: resBody.success ?? true }
      }

      // If extracted is an object (not primitive, not array), attach _message as non-enumerable
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
  (error: AxiosError<any>) => {
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
