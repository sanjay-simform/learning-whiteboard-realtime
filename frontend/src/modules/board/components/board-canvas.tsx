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

type Point = {
  x: number
  y: number
}

type PanStart = {
  pointerX: number
  pointerY: number
  panX: number
  panY: number
}

type TextModalPosition = {
  screenX: number
  screenY: number
  boardX: number
  boardY: number
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
  const isPanningRef = useRef(false)
  const panRef = useRef<Point>({ x: 0, y: 0 })
  const panStartRef = useRef<PanStart>({
    pointerX: 0,
    pointerY: 0,
    panX: 0,
    panY: 0,
  })

  const { user } = useAuth()
  const { selectedTool } = useWhiteboardStore()
  const [cursors, setCursors] = useState<Record<number, CursorPayload>>({})
  const [showTextModal, setShowTextModal] = useState(false)
  const [textModalPos, setTextModalPos] = useState<TextModalPosition>({
    screenX: 0,
    screenY: 0,
    boardX: 0,
    boardY: 0,
  })
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 })

  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useShapeDrawing(pixiAppRef)

  const applyPanOffset = useCallback((nextPanOffset: Point) => {
    panRef.current = nextPanOffset

    const stage = pixiAppRef.current?.getApplication()?.stage
    stage?.position.set(nextPanOffset.x, nextPanOffset.y)

    setPanOffset(nextPanOffset)
  }, [])

  const getCanvasPoint = useCallback((event: MouseEvent): Point | null => {
    const rect = appRef.current?.getBoundingClientRect()
    if (!rect) return null

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }, [])

  const getBoardPoint = useCallback((canvasPoint: Point): Point => {
    return {
      x: canvasPoint.x - panRef.current.x,
      y: canvasPoint.y - panRef.current.y,
    }
  }, [])

  useEffect(() => {
    const stage = pixiAppRef.current?.getApplication()?.stage
    if (!stage) return

    stage.sortableChildren = true
    stage.position.set(panRef.current.x, panRef.current.y)
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

    const handlePanMove = (event: MouseEvent) => {
      if (selectedTool !== "hand" || !isPanningRef.current) return

      event.preventDefault()

      const nextPanOffset = {
        x:
          panStartRef.current.panX +
          event.clientX -
          panStartRef.current.pointerX,
        y:
          panStartRef.current.panY +
          event.clientY -
          panStartRef.current.pointerY,
      }

      applyPanOffset(nextPanOffset)
    }

    const stopPanning = () => {
      if (!isPanningRef.current) return

      isPanningRef.current = false
    }

    const handleCanvasMouseMove = (event: MouseEvent) => {
      const canvasPoint = getCanvasPoint(event)
      if (!canvasPoint) return

      latestPosRef.current = {
        x: canvasPoint.x,
        y: canvasPoint.y,
        userId: user?.id || 0,
      }

      if (selectedTool === "hand") {
        return
      }

      // Draw shapes on canvas (except for pointer and text tools)
      if (selectedTool !== "pointer" && selectedTool !== "text") {
        const boardPoint = getBoardPoint(canvasPoint)
        handleMouseMove(selectedTool, boardPoint.x, boardPoint.y)
      }
    }

    const handleCanvasMouseDown = (event: MouseEvent) => {
      const canvasPoint = getCanvasPoint(event)
      if (!canvasPoint) return

      const boardPoint = getBoardPoint(canvasPoint)

      if (selectedTool === "hand") {
        event.preventDefault()

        isPanningRef.current = true
        panStartRef.current = {
          pointerX: event.clientX,
          pointerY: event.clientY,
          panX: panRef.current.x,
          panY: panRef.current.y,
        }

        return
      }

      if (selectedTool === "text") {
        setTextModalPos({
          screenX: event.clientX,
          screenY: event.clientY,
          boardX: boardPoint.x,
          boardY: boardPoint.y,
        })
        setShowTextModal(true)
      } else if (selectedTool !== "pointer") {
        handleMouseDown(selectedTool, boardPoint.x, boardPoint.y)
      }
    }

    const handleCanvasMouseUp = (event: MouseEvent) => {
      const rect = appRef.current!.getBoundingClientRect()

      if (selectedTool === "hand") {
        stopPanning()
        return
      }

      const canvasPoint = getCanvasPoint(event)
      if (!canvasPoint) return

      const boardPoint = getBoardPoint(canvasPoint)

      if (selectedTool !== "pointer" && selectedTool !== "text") {
        const shapeData = handleMouseUp(
          selectedTool,
          boardPoint.x,
          boardPoint.y
        )

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
    window.addEventListener("mousemove", handlePanMove)
    window.addEventListener("mouseup", stopPanning)

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
      window.removeEventListener("mousemove", handlePanMove)
      window.removeEventListener("mouseup", stopPanning)
    }
  }, [
    user?.id,
    boardId,
    selectedTool,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    applyPanOffset,
    getCanvasPoint,
    getBoardPoint,
  ])

  useEffect(() => {
    if (selectedTool !== "hand") {
      isPanningRef.current = false
    }
  }, [selectedTool])

  return (
    <>
      {showTextModal && (
        <TextInputModal
          showTextModal={showTextModal}
          x={textModalPos.screenX}
          y={textModalPos.screenY}
          onSubmit={(text) => {
            const rect = appRef.current?.getBoundingClientRect()
            if (rect) {
              const textObj = new PIXI.Text({
                text,
                style: {
                  fontSize: 18,
                  fill: "#111827",
                  fontFamily: "Inter Variable, Inter, sans-serif",
                  fontWeight: "600",
                },
                resolution: 2,
                x: textModalPos.boardX,
                y: textModalPos.boardY,
              })
              const appContainer = pixiAppRef.current?.getApplication()?.stage
              appContainer?.addChild(textObj)
              const normalizedShape = normalizeShapeForBroadcast(
                {
                  type: "text",
                  x: textModalPos.boardX,
                  y: textModalPos.boardY,
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
        className={`board-canvas-grid h-full w-full select-none ${getCursorStyle(selectedTool)}`}
        style={{
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        }}
      >
        <Application
          className="h-full w-full"
          antialias={true}
          backgroundAlpha={0}
          ref={pixiAppRef}
          resizeTo={window}
        >
          <AppContent cursors={cursors} viewportOffset={panOffset} />
        </Application>
      </div>
    </>
  )
}
