import apiClient, { getActiveToken, setAuthToken } from "@/lib/api-client"
import type { LoginRequest, LoginResponse } from "./types"

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await apiClient.post<any, LoginResponse>("/auth/login", data)
    if (res && res.accessToken && typeof window !== "undefined") {
      setAuthToken(res.accessToken)
      localStorage.setItem("auth_user", JSON.stringify(res))
    }
    return res
  },

  logout: () => {
    setAuthToken(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user")
    }
  },

  getCurrentToken: (): string | null => {
    return getActiveToken()
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

  updateCurrentUserAvatar: (avatarUrl: string | null) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        try {
          const user = JSON.parse(stored) as LoginResponse
          user.avatarUrl = avatarUrl || undefined
          localStorage.setItem("auth_user", JSON.stringify(user))
          window.dispatchEvent(new CustomEvent("user-avatar-updated", { detail: avatarUrl }))
        } catch {
          // ignore
        }
      }
    }
  },

}
