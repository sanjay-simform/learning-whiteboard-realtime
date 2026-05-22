import { getEventCodeForEvent } from "../../../socket/ws-events.type"

export function generateBoardCursorUpdateEvent({
  boardId,
  userId,
  x,
  y,
}: {
  boardId: number
  userId: number
  x: number
  y: number
}) {
  const buffer = new ArrayBuffer(9)

  const view = new DataView(buffer)
  const normalizedX = Math.floor((x / window.innerWidth) * 65535)
  const normalizedY = Math.floor((y / window.innerHeight) * 65535)
  // 1 byte event code
  view.setUint8(0, getEventCodeForEvent("cursor.update"))

  // 2 byte x
  view.setUint16(1, normalizedX)

  // 2 byte y
  view.setUint16(3, normalizedY)
  // 2 byte userId
  view.setUint16(5, userId)
  // 2 byte for boardId
  view.setUint16(7, boardId)

  return buffer
}
