import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { wsClient } from "../../../socket/ws-client"
import { useAuth } from "../../../context/Auth.context"
import { BoardCanvas } from "../components/board-canvas"
import { TopBar } from "../components/topbar"
import { Sidebar } from "../components/sidebar"

export default function BoardPage() {
  const { boardId } = useParams()
  const { user } = useAuth()

  useEffect(() => {
    // Join board on mount
    if (!boardId) {
      return
    }

    wsClient.send("board.join", {
      boardId: +boardId,
    })

    return () => {
      // Cleanup if needed
    }
  }, [boardId, user])

  return (
    <div className="board-app-shell flex h-screen overflow-hidden text-foreground">
      <Sidebar />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          boardId={+(boardId ?? 0)}
          boardName={`Board #${boardId ?? 0}`}
        />

        <div className="relative flex-1 overflow-hidden p-3 sm:p-4">
          <div className="board-surface-enter relative h-full overflow-hidden rounded-[8px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.13),0_2px_10px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <BoardCanvas boardId={+(boardId ?? 0)} />

            <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/5 bg-white/88 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <span className="board-live-pulse h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
              Synced
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
