import apiClient from "../../axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./auth.service.dto"
import {
  handleApiRequest,
  type ApiResponse,
  type AxiosApiResponse,
} from "../../util"

async function registerApi(
  payload: RegisterRequest
): Promise<AxiosApiResponse<RegisterResponse>> {
  return await handleApiRequest(
    apiClient.post<ApiResponse<RegisterResponse>>("/auth/signup", payload),
    "Signup failed"
  )
}

async function login(
  payload: LoginRequest
): Promise<AxiosApiResponse<LoginResponse>> {
  const a = await apiClient.post<LoginResponse>("/auth/login", payload)
  return await handleApiRequest(
    apiClient.post<ApiResponse<LoginResponse>>("/auth/login", payload),
    "Login failed"
  )
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
