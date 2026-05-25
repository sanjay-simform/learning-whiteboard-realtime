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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          boardId={+(boardId ?? 0)}
          boardName={`Board #${boardId ?? 0}`}
        />

        {/* Canvas Area */}
        <div className="board relative flex-1">
          <BoardCanvas boardId={+(boardId ?? 0)} />
        </div>
      </div>
    </div>
  )
}
