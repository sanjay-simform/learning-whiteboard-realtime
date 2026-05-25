// websocket/ws-types.ts

export interface ServerEvents {
  heartbeat: {
    ts: number
  }
  "cursor.update": {
    userId: number
    boardId: number
    x: number
    y: number
  }

  "board.join": {
    boardId: number
    userId: number
  }

  "board.leave": {
    boardId: number
  }

  "board.shape.draw": {
    boardId: number
    userId: number
    shape: {
      type: "rectangle" | "circle" | "line" | "text"
      x: number
      y: number
      width?: number
      height?: number
      radius?: number
      text?: string
    }
  }
}

export interface ClientEvents {
  "board.join": {
    boardId: number
  }
  "board.leave": {
    boardId: number
  }

  "cursor.move": {
    boardId: number
    x: number
    y: number
  }

  "board.shape.draw": {
    boardId: number
    userId: number
    shape: {
      type: "rectangle" | "circle" | "line" | "text"
      x: number
      y: number
      width?: number
      height?: number
      radius?: number
      text?: string
    }
  }
}

export const getEventCodeForEvent = (event: keyof ServerEvents): number => {
  switch (event) {
    case "heartbeat":
      return 3
    case "cursor.update":
      return 4
    case "board.join":
      return 5
    case "board.leave":
      return 6
    default:
      throw new Error(`Unknown event: ${event satisfies never}`)
  }
}

export const getEventFromEventCode = (code: number): keyof ServerEvents => {
  switch (code) {
    case 3:
      return "heartbeat"
    case 4:
      return "cursor.update"
    case 5:
      return "board.join"
    case 6:
      return "board.leave"
    default:
      throw new Error(`Unknown event code: ${code}`)
  }
}
