import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { wsClient } from "../../../socket/ws-client"
import { toast } from "sonner"
import { RemoteCursor } from "../../../components/remote-cursor"
import { generateBoardCursorUpdateEvent } from "../util/board-socket-event.util"
import { useAuth } from "../../../context/Auth.context"

const MOVE_THRESHOLD = 10 // px
const SEND_INTERVAL = 33 //

type CursorPayload = {
  x: number
  y: number
}
export default function BoardPage() {
  const { boardId } = useParams()
  const [cursor, setCursor] = useState<{
    userId: number
    x: number
    y: number
  } | null>(null)
  const { user } = useAuth()

  const latestPosRef = useRef<CursorPayload>({
    x: 0,
    y: 0,
  })

  // last sent cursor
  const lastSentRef = useRef<CursorPayload>({
    x: 0,
    y: 0,
  })

  const lastSendTimeRef = useRef(0)
  const boardRef = useRef<HTMLDivElement>(null)

  const handleBoardJoin = (data: any) => {
    toast.success(`userId ${data.userId} joined board`)
  }

  const handleCursorUpdate = (data) => {
    setCursor({
      userId: data.userId,
      x: data.x,
      y: data.y,
    })
  }
  useEffect(() => {
    // Set up event listeners when component mounts
    if (!boardId) {
      return
    }
    wsClient.send("board.join", {
      boardId: +boardId,
    })
    wsClient.on("board.join", handleBoardJoin)
    wsClient.on("cursor.update", handleCursorUpdate)

    // Cleanup: remove listeners when component unmounts
    return () => {
      console.log("Cleaning up listeners")
      wsClient.off("board.join", handleBoardJoin)
      wsClient.off("cursor.update", handleCursorUpdate)
    }
  }, [boardId])

  const handlePointerMove = (e: PointerEvent) => {
    latestPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    }
  }
  useEffect(() => {
    let rafId: number
    const boardElement = boardRef.current
    if (!boardElement) {
      return
    }

    const tick = () => {
      const latest = latestPosRef.current
      const prev = lastSentRef.current

      const dx = latest.x - prev.x
      const dy = latest.y - prev.y

      const distanceSq = dx * dx + dy * dy

      const now = performance.now()

      const movedEnough = distanceSq >= MOVE_THRESHOLD * MOVE_THRESHOLD

      const canSend = now - lastSendTimeRef.current >= SEND_INTERVAL

      if (movedEnough && canSend) {
        lastSendTimeRef.current = now

        lastSentRef.current = latest
        // send ws event
        const cursorEventPayload = generateBoardCursorUpdateEvent({
          x: latest.x,
          y: latest.y,
          userId: user?.id ?? 0,
          boardId: +boardId!,
        })
        wsClient.sendRaw(cursorEventPayload)
      }

      rafId = requestAnimationFrame(tick)
    }

    boardElement?.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    })

    rafId = requestAnimationFrame(tick)

    return () => {
      boardElement?.removeEventListener("pointermove", handlePointerMove)
      cancelAnimationFrame(rafId)
    }
  }, [])
  return (
    <div
      ref={boardRef}
      className="flex min-h-screen items-center justify-center overflow-hidden border-2 border-secondary p-6"
    >
      <div className="max-w-lg space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Board Page</h1>

          {cursor && (
            <RemoteCursor
              name={`User ${cursor.userId}`}
              x={cursor.x}
              y={cursor.y}
            />
          )}
        </div>
      </div>
    </div>
  )
}
