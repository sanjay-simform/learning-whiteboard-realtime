import axios, { AxiosError } from "axios"
import { useAuth } from "../context/Auth.context"

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// add the cors

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // check the route from where we get the unauthorized error, if it is from the auth route then do not redirect to signin page
    const authRoutes = ["/auth/login", "/auth/signup"]
    if (
      error.response?.status === 401 &&
      !authRoutes.includes(error?.config?.url || "")
    ) {
      localStorage.removeItem("access_token")
      window.location.href = "/signin"
    }
    return Promise.reject(error)
  }
)

export default apiClient

export interface AxiosErrorResponse {
  status: number
  message: string
  code?: string
  details?: unknown
}

export type AxiosApiResponse<T> =
  | {
      data: T
      error: null
    }
  | { data: null; error: AxiosErrorResponse }
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}
