import { Users } from "lucide-react"
import { useGetBoardActiveMembers } from "../../../api-client/service/board/board.service"
import { useCallback, useEffect, useRef, useState } from "react"
import { wsClient } from "../../../socket/ws-client"
import { useAuth } from "../../../context/Auth.context"
import { toast } from "sonner"

interface TopBarProps {
  boardName: string
  boardId: number
}
interface BoardUser {
  id: number
  name: string
  username: string
  avatar?: string
}

export function TopBar({ boardName, boardId }: TopBarProps) {
  const hydratedRef = useRef(false)

  const [boardUsers, setBoardUsers] = useState<BoardUser[]>([])

  const activeBoardMembersQuery = useGetBoardActiveMembers(boardId)

  const handleBoardJoin = useCallback((data: any) => {
    setBoardUsers((prev) => {
      const exists = prev.some((u) => u.id === data.userId)

      if (exists) return prev

      return [
        ...prev,
        {
          id: data.userId,
          name: data.userName || `User ${data.userId}`,
          username: data.userName || `User ${data.userId}`,
          avatar: data.avatar ?? "",
        },
      ]
    })

    toast.success(`User ${data.userId} joined board`)
  }, [])

  // Hydrate once from API snapshot
  useEffect(() => {
    if (hydratedRef.current) return

    const users = activeBoardMembersQuery.data?.data?.users

    if (!users) return

    hydratedRef.current = true

    setBoardUsers(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: "",
      }))
    )
  }, [activeBoardMembersQuery.data])

  // Subscribe websocket
  useEffect(() => {
    if (!boardId) return

    wsClient.on("board.join", handleBoardJoin)

    return () => {
      wsClient.off("board.join", handleBoardJoin)
    }
  }, [boardId, handleBoardJoin])

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{boardName}</h1>

        <p className="text-sm text-muted-foreground">
          Collaborative whiteboard
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />

          <span className="text-sm font-medium text-foreground">
            {boardUsers.length} {boardUsers.length === 1 ? "person" : "people"}
          </span>
        </div>

        <div>
          {activeBoardMembersQuery.isLoading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : activeBoardMembersQuery.isError ? (
            <span className="text-sm text-destructive">
              Error loading users
            </span>
          ) : (
            <div className="flex -space-x-2">
              {boardUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
