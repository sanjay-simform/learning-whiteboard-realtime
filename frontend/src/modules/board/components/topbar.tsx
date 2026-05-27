import { CheckCircle2, Users, Wifi } from "lucide-react"
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
  const visibleUsers = boardUsers.slice(0, 5)
  const hiddenUserCount = Math.max(boardUsers.length - visibleUsers.length, 0)

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
    <header className="board-topbar-enter z-20 flex min-h-18 items-center justify-between gap-4 border-b border-white/75 bg-white/86 px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.05),0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-6">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase">
          <span className="board-live-pulse h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
          Live board
        </div>

        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {boardName}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm md:flex">
          <Wifi className="h-3.5 w-3.5" />
          Online
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm sm:flex">
          <Users className="h-4 w-4 text-muted-foreground" />

          <span>
            {boardUsers.length} {boardUsers.length === 1 ? "person" : "people"}
          </span>
        </div>

        <div className="min-w-8">
          {activeBoardMembersQuery.isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          ) : activeBoardMembersQuery.isError ? (
            <span className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
              Offline
            </span>
          ) : (
            <div className="flex items-center -space-x-2">
              {visibleUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-[0_4px_12px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:z-10 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: [
                      "#0f766e",
                      "#2563eb",
                      "#e11d48",
                      "#ca8a04",
                      "#7c3aed",
                    ][index % 5],
                  }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}

              {hiddenUserCount > 0 && (
                <div className="flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-foreground px-2 text-xs font-bold text-background shadow-[0_4px_12px_rgba(15,23,42,0.18)]">
                  +{hiddenUserCount}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden h-8 items-center gap-1.5 rounded-full border border-black/5 bg-white px-2.5 text-xs font-semibold text-muted-foreground shadow-sm lg:flex">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Saved
        </div>
      </div>
    </header>
  )
}
