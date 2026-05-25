export interface BoardActiveMemberRequest {
  boardId: number
}

export interface BoardActiveMemberResponse {
  users: {
    id: number
    username: string
    name: string
  }[]
}
