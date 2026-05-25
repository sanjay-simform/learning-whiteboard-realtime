import { apiClient } from "../../axios"
import type { BoardActiveMemberResponse } from "./board.service.dto"
import { useQuery } from "@tanstack/react-query"
import { handleApiRequest, type AxiosApiResponse } from "../../util"

export async function getBoardActiveMembers(
  boardId: number
): Promise<AxiosApiResponse<BoardActiveMemberResponse>> {
  return await handleApiRequest(
    apiClient.get<BoardActiveMemberResponse>(
      `/board/${boardId}/current-members`
    ),
    "Failed to fetch board active members"
  )
}

export function useGetBoardActiveMembers(boardId: number) {
  return useQuery({
    queryKey: ["boardActiveMembers", boardId],
    queryFn: () => getBoardActiveMembers(boardId),
    staleTime: 5 * 60 * 1000,
  })
}
