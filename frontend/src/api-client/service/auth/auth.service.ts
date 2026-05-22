import apiClient, { type ApiResponse, type AxiosApiResponse } from "../../axios"
import { AxiosError } from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./auth.service.dto"

async function registerApi(
  payload: RegisterRequest
): Promise<AxiosApiResponse<RegisterResponse>> {
  try {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/signup",
      payload
    )

    return {
      data: response.data,
      error: null,
    }
  } catch (err) {
    const error = err as AxiosError
    return {
      data: null,
      error: {
        status: error.response?.status || 500,
        message:
          error.response?.data?.message || error.message || "Signup failed",
        code: error.code,
        details: error.response?.data,
      },
    }
  }
}

async function login(
  payload: LoginRequest
): Promise<AxiosApiResponse<LoginResponse>> {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload
    )

    return {
      data: response.data.data,
      error: null,
    }
  } catch (err) {
    const error = err as AxiosError
    return {
      data: null,
      error: {
        status: error.response?.status || 500,
        message:
          error.response?.data?.message || error.message || "Login failed",
        code: error.code,
        details: error.response?.data,
      },
    }
  }
}

export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (response) => {
      // Invalidate user query to refetch
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ["profile"] })
      }
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      // Invalidate user query to refetch
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ["profile"] })
      }
    },
  })
}
