import { useEffect, useRef, useState, useCallback } from "react"
import { useAuth } from "../../../context/Auth.context"
import { wsClient } from "../../../socket/ws-client"
import { generateBoardCursorUpdateEvent } from "../util/board-socket-event.util"
import { Application, extend, type ApplicationRef } from "@pixi/react"
import { Sprite, Container, Graphics } from "pixi.js"
import { useWhiteboardStore, type Tool } from "../../../store/whiteboard.store"
import { SHAPE_CONFIG, useShapeDrawing } from "../hooks/use-shape-drawing"
import {
  denormalizeCoordinate,
  denormalizeShapeFromBroadcast,
  drawShapeFromEvent,
  normalizeShapeForBroadcast,
  type BoardShapePayload,
} from "../hooks/shape-drawing.util"
import { TextInputModal } from "./text-input-modal"
import { AppContent } from "./app-content"
import * as PIXI from "pixi.js"

extend({ Sprite, Container, Graphics })
const MOVE_THRESHOLD = 5 // px
const SEND_INTERVAL = 33 // ms

type CursorPayload = {
  x: number
  y: number
  userId: number
}

export function BoardCanvas({ boardId }: { boardId: number }) {
  const latestPosRef = useRef<CursorPayload>({
    x: 0,
    y: 0,
    userId: 0,
  })

  const lastSentRef = useRef<CursorPayload>({
    x: 0,
    y: 0,
    userId: 0,
  })
  const appRef = useRef<HTMLDivElement>(null)
  const pixiAppRef = useRef<ApplicationRef | null>(null)
  const lastSendTimeRef = useRef(0)

  const { user } = useAuth()
  const { selectedTool } = useWhiteboardStore()
  const [cursors, setCursors] = useState<Record<number, CursorPayload>>({})
  const [showTextModal, setShowTextModal] = useState(false)
  const [textModalPos, setTextModalPos] = useState({ x: 0, y: 0 })

  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useShapeDrawing(pixiAppRef)

  useEffect(() => {
    const stage = pixiAppRef.current?.getApplication()?.stage
    if (!stage) return

    stage.sortableChildren = true
  }, [])

  const getCursorStyle = useCallback((tool: Tool): string => {
    switch (tool) {
      case "pointer":
        return "cursor-pointer"
      case "hand":
        return "cursor-grab active:cursor-grabbing"
      case "rectangle":
        return "cursor-crosshair"
      case "circle":
        return "cursor-crosshair"
      case "line":
        return "cursor-crosshair"
      case "text":
        return "cursor-text"
      default:
        return "cursor-default"
    }
  }, [])

  const handleCursorUpdate = useCallback(
    (data: { userId: number; x: number; y: number; boardId: number }) => {
      const rect = appRef.current?.getBoundingClientRect()
      if (!rect) return

      setCursors((prev) => ({
        ...prev,
        [data.userId]: {
          x: denormalizeCoordinate(data.x, rect.width),
          y: denormalizeCoordinate(data.y, rect.height),
          userId: data.userId,
        },
      }))
    },
    []
  )

  const handleShapeDraw = useCallback(
    (data: { userId: number; boardId: number; shape: BoardShapePayload }) => {
      const rect = appRef.current?.getBoundingClientRect()
      const stageContainer = pixiAppRef.current?.getApplication()?.stage
      if (!stageContainer || !rect) return

      const localShape = denormalizeShapeFromBroadcast(data.shape, rect)

      drawShapeFromEvent(stageContainer, localShape, SHAPE_CONFIG)
    },
    [pixiAppRef]
  )

  useEffect(() => {
    wsClient.on("board.shape.draw", handleShapeDraw)

    return () => {
      wsClient.off("board.shape.draw", handleShapeDraw)
    }
  }, [handleShapeDraw])
  // Initialize Pixi Application and WebSocket
  useEffect(() => {
    wsClient.on("cursor.update", handleCursorUpdate)

    return () => {
      wsClient.off("cursor.update", handleCursorUpdate)
    }
  }, [handleCursorUpdate])

  // Cursor tracking and sending
  useEffect(() => {
    if (!appRef.current) return
    const handleCanvasMouseMove = (event: MouseEvent) => {
      const rect = appRef.current!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      latestPosRef.current = {
        x,
        y,
        userId: user?.id || 0,
      }

      // Draw shapes on canvas (except for pointer and hand tools)
      if (
        selectedTool !== "pointer" &&
        selectedTool !== "hand" &&
        selectedTool !== "text"
      ) {
        handleMouseMove(selectedTool, x, y)
      }
    }

    const handleCanvasMouseDown = (event: MouseEvent) => {
      const rect = appRef.current!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (selectedTool === "text") {
        setTextModalPos({ x: event.clientX, y: event.clientY })
        setShowTextModal(true)
      } else if (selectedTool !== "pointer" && selectedTool !== "hand") {
        handleMouseDown(selectedTool, x, y)
      }
    }

    const handleCanvasMouseUp = (event: MouseEvent) => {
      const rect = appRef.current!.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (
        selectedTool !== "pointer" &&
        selectedTool !== "hand" &&
        selectedTool !== "text"
      ) {
        const shapeData = handleMouseUp(selectedTool, x, y)

        if (shapeData) {
          console.log("Shape data to send:", shapeData)
          const normalizedShape = normalizeShapeForBroadcast(
            {
              type: selectedTool,
              ...shapeData,
            },
            rect
          )

          wsClient.send("board.shape.draw", {
            boardId,
            userId: user?.id || 0,
            shape: normalizedShape,
          })
        }
      }
    }

    let rafId: number
    const appref = appRef.current

    appref?.addEventListener("mousemove", handleCanvasMouseMove)
    appref?.addEventListener("mousedown", handleCanvasMouseDown)
    appref?.addEventListener("mouseup", handleCanvasMouseUp)

    const tick = () => {
      const latest = latestPosRef.current
      const prev = lastSentRef.current
      const rect = appref?.getBoundingClientRect()

      if (!rect) {
        rafId = requestAnimationFrame(tick)
        return
      }

      const dx = latest.x - prev.x
      const dy = latest.y - prev.y

      const distanceSq = dx * dx + dy * dy

      const now = performance.now()

      const movedEnough = distanceSq >= MOVE_THRESHOLD * MOVE_THRESHOLD

      const canSend = now - lastSendTimeRef.current >= SEND_INTERVAL

      if (movedEnough && canSend && user?.id && boardId) {
        lastSendTimeRef.current = now
        lastSentRef.current = latest

        const cursorEventPayload = generateBoardCursorUpdateEvent({
          x: latest.x,
          y: latest.y,
          userId: user.id,
          boardId,
          canvasHeight: rect.height,
          canvasWidth: rect.width,
        })

        wsClient.sendRaw(cursorEventPayload)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      appref?.removeEventListener("mousemove", handleCanvasMouseMove)
      appref?.removeEventListener("mousedown", handleCanvasMouseDown)
      appref?.removeEventListener("mouseup", handleCanvasMouseUp)
    }
  }, [
    user?.id,
    boardId,
    selectedTool,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  ])

  return (
    <>
      {showTextModal && (
        <TextInputModal
          showTextModal={showTextModal}
          x={textModalPos.x}
          y={textModalPos.y}
          onSubmit={(text) => {
            const rect = appRef.current?.getBoundingClientRect()
            if (rect) {
              const canvasX = textModalPos.x - rect.left
              const canvasY = textModalPos.y - rect.top
              const textObj = new PIXI.Text({
                text,
                style: {
                  fontSize: 16,
                  fill: "#000000",
                  fontFamily: "Arial",
                },
                resolution: 2,
                x: canvasX,
                y: canvasY,
              })
              const appContainer = pixiAppRef.current?.getApplication()?.stage
              appContainer?.addChild(textObj)
              const normalizedShape = normalizeShapeForBroadcast(
                {
                  type: "text",
                  x: canvasX,
                  y: canvasY,
                  text,
                },
                rect
              )

              wsClient.send("board.shape.draw", {
                boardId,
                userId: user?.id || 0,
                shape: normalizedShape,
              })
            }
            setShowTextModal(false)
          }}
          onCancel={() => setShowTextModal(false)}
        />
      )}
      <div
        ref={appRef}
        className={`h-full w-full bg-white ${getCursorStyle(selectedTool)}`}
      >
        <Application
          className="h-full w-full"
          // antialias={true}
          background={0xffffff}
          ref={pixiAppRef}
          resizeTo={window}
        >
          <AppContent cursors={cursors} />
        </Application>
      </div>
    </>
  )
}
