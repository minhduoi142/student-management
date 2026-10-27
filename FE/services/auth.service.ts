import apiClient from "@/lib/api-client"
import type { LoginRequest, LoginResponse } from "./types"

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<any, LoginResponse>("/auth/login", data)
    if (res && res.accessToken && typeof window !== "undefined") {
      localStorage.setItem("access_token", res.accessToken)
      localStorage.setItem("auth_user", JSON.stringify(res))
    }
    return res
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("auth_user")
    }
  },

  getCurrentToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token")
    }
    return null
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
