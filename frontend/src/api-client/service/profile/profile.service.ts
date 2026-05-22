import type { AxiosError } from "axios"
import { apiClient, type AxiosApiResponse } from "../../axios"
import type { ProfileResponse } from "./profile.service.dto"
import { useQuery } from "@tanstack/react-query"

export async function getProfileApi(): Promise<
  AxiosApiResponse<ProfileResponse>
> {
  try {
    const response = await apiClient.get<ProfileResponse>("/profile")
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

export function useGetProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    staleTime: 5 * 60 * 1000,
  })
}
