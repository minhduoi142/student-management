import apiClient, { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api-client"
import type { LoginRequest, LoginResponse } from "./types"

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<any, LoginResponse>("/auth/login", data)
    if (res && res.accessToken && typeof window !== "undefined") {
      setStoredToken(res.accessToken)
      localStorage.setItem("auth_user", JSON.stringify(res))
    }
    return res
  },

  logout: () => {
    clearStoredToken()
  },

  getCurrentToken: (): string | null => {
    return getStoredToken()
  },

  getCurrentUser: (): LoginResponse | null => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        try {
          return JSON.parse(stored) as LoginResponse
        } catch {
          return null
        }
      }
    }
    return null
  },
}
