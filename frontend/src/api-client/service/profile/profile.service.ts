import { apiClient } from "../../axios"
import type { ProfileResponse } from "./profile.service.dto"
import { useQuery } from "@tanstack/react-query"
import { handleApiRequest, type AxiosApiResponse } from "../../util"

export async function getProfileApi(): Promise<
  AxiosApiResponse<ProfileResponse>
> {
  return await handleApiRequest<ProfileResponse>(
    apiClient.get<ProfileResponse>("/profile"),
    "Failed to fetch profile"
  )
}

export function useGetProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
    staleTime: 5 * 60 * 1000,
  })
}
