import { useRef, useCallback, type RefObject } from "react"
import * as PIXI from "pixi.js"
import {
  drawRectangle,
  drawCircle,
  drawLine,
  drawText,
} from "./shape-drawing.util"
import { type Tool } from "../../../store/whiteboard.store"
import type { ApplicationRef } from "@pixi/react"

export interface DrawingState {
  isDrawing: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  tempShape: PIXI.Graphics | PIXI.Text | null
}

export const SHAPE_CONFIG = {
  color: 0x3b82f6,
  lineWidth: 2,
  fillAlpha: 1,
}

export function useShapeDrawing(
  containerRef: RefObject<ApplicationRef | null>
) {
  const drawingStateRef = useRef<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    tempShape: null,
  })

  const handleMouseDown = useCallback(
    (_tool: Tool, x: number, y: number) => {
      if (!containerRef.current) return

      drawingStateRef.current = {
        isDrawing: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        tempShape: null,
      }
    },
    [containerRef]
  )

  const handleMouseMove = useCallback(
    (tool: Tool, x: number, y: number) => {
      const stageContainer = containerRef?.current?.getApplication()?.stage
      const state = drawingStateRef.current
      if (!state.isDrawing || !stageContainer) return

      state.currentX = x
      state.currentY = y

      // Remove previous temp shape
      if (state.tempShape) {
        stageContainer.removeChild(state.tempShape)
      }

      const width = x - state.startX
      const height = y - state.startY

      if (tool === "rectangle") {
        state.tempShape = drawRectangle(
          stageContainer,
          state.startX,
          state.startY,
          Math.abs(width),
          Math.abs(height),
          { ...SHAPE_CONFIG, fillAlpha: 0.1 }
        )
      } else if (tool === "circle") {
        const radius = Math.sqrt(width * width + height * height)
        state.tempShape = drawCircle(
          stageContainer,
          state.startX,
          state.startY,
          radius,
          {
            ...SHAPE_CONFIG,
            fillAlpha: 0.1,
          }
        )
      } else if (tool === "line") {
        state.tempShape = drawLine(
          stageContainer,
          state.startX,
          state.startY,
          x,
          y,
          SHAPE_CONFIG
        )
      }
    },
    [containerRef]
  )

  const handleMouseUp = useCallback(
    (tool: Tool, x: number, y: number) => {
      const state = drawingStateRef.current
      const stageContainer = containerRef?.current?.getApplication()?.stage
      if (!stageContainer) return

      state.isDrawing = false

      // Remove temp shape
      if (state.tempShape) {
        stageContainer.removeChild(state.tempShape)
        state.tempShape = null
      }

      // Finalize shape
      const width = x - state.startX
      const height = y - state.startY

      if (
        tool === "rectangle" &&
        (Math.abs(width) > 5 || Math.abs(height) > 5)
      ) {
        drawRectangle(
          stageContainer,
          state.startX,
          state.startY,
          Math.abs(width),
          Math.abs(height),
          SHAPE_CONFIG
        )
        console.log("Drawing rectangle with width:", width, "height:", height)
        return {
          height,
          width,
        }
      } else if (tool === "circle") {
        const radius = Math.sqrt(width * width + height * height)
        if (radius > 5) {
          drawCircle(
            stageContainer,
            state.startX,
            state.startY,
            radius,
            SHAPE_CONFIG
          )
          return {
            height,
            width,
            radius,
          }
        }
      } else if (
        tool === "line" &&
        (Math.abs(width) > 5 || Math.abs(height) > 5)
      ) {
        drawLine(stageContainer, state.startX, state.startY, x, y, SHAPE_CONFIG)
        return {
          height,
          width,
        }
      }
    },
    [containerRef]
  )

  const handleTextInput = useCallback(
    (text: string, x: number, y: number) => {
      const stageContainer = containerRef?.current?.getApplication()?.stage
      if (!stageContainer) return
      if (text.trim()) {
        drawText(stageContainer, text, x, y, 16)
      }
    },
    [containerRef]
  )

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTextInput,
  }
}
