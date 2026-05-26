import { getEventCodeForEvent } from "../../../socket/ws-events.type"

export function generateBoardCursorUpdateEvent({
  boardId,
  userId,
  x,
  y,
  canvasHeight,
  canvasWidth,
}: {
  boardId: number
  userId: number
  x: number
  y: number
  canvasHeight: number
  canvasWidth: number
}) {
  const buffer = new ArrayBuffer(13)

  const view = new DataView(buffer)
  const normalizedX = Math.floor((x / Math.max(canvasWidth, 1)) * 65535)
  const normalizedY = Math.floor((y / Math.max(canvasHeight, 1)) * 65535)
  // const normalizedX = x
  // const normalizedY = y
  // 1 byte event code
  view.setUint8(0, getEventCodeForEvent("cursor.update"))

  // 4 byte x
  view.setUint32(1, normalizedX)

  // 4 byte y
  view.setUint32(5, normalizedY)
  // 2 byte userId
  view.setUint16(9, userId)
  // 2 byte for boardId
  view.setUint16(11, boardId)

  return buffer
}
