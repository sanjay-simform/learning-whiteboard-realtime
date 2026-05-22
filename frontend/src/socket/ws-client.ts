// websocket/ws-client.ts

import {
  getEventCodeForEvent,
  getEventFromEventCode,
  type ServerEvents,
} from "./ws-events.type"
import type { ClientEvents } from "./ws-events.type"

type EventHandler = (payload: unknown) => void

class WSClient {
  private socket: WebSocket | null = null

  private listeners = new Map<string, Set<EventHandler>>()

  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  private reconnectAttempts = 0

  private isConnecting = false

  private activeToken: string | null = null

  private shouldReconnect = false

  connect(token: string) {
    this.shouldReconnect = true

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (
      this.activeToken === token &&
      (this.socket?.readyState === WebSocket.OPEN ||
        this.socket?.readyState === WebSocket.CONNECTING ||
        this.isConnecting)
    ) {
      return
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    this.isConnecting = true
    this.activeToken = token

    const ws = new WebSocket(
      `${import.meta.env.VITE_API_URL}/ws?token=${token}`
    )

    this.socket = ws

    ws.onopen = () => {
      console.log("ws connected")

      if (this.socket !== ws) {
        return
      }

      this.isConnecting = false
      this.reconnectAttempts = 0
    }

    ws.binaryType = "arraybuffer"

    ws.onmessage = (event) => {
      console.log("Received message from server:", typeof event.data)
      if (typeof event.data === "string") {
        try {
          const parsed = JSON.parse(event.data)

          this.emitLocal(parsed.event, parsed.data)
        } catch (err) {
          console.error(err)
        }
      }
      if (event.data instanceof ArrayBuffer) {
        const view = new DataView(event.data)
        let offset = 0

        const eventCode = view.getUint8(offset)
        offset += 1

        const x = view.getUint16(offset)
        offset += 2
        const y = view.getUint16(offset)
        offset += 2
        const userId = view.getUint16(offset)
        offset += 2
        const boardId = view.getUint16(offset)
        offset += 2

        const eventName = getEventFromEventCode(eventCode)
        const actualX = (x / 65535) * window.innerWidth
        const actualY = (y / 65535) * window.innerHeight
        this.emitLocal(eventName, {
          boardId,
          x: actualX,
          y: actualY,
          userId,
        } as ServerEvents[typeof eventName])
      }
    }

    ws.onclose = (event) => {
      console.log("ws disconnected")

      if (this.socket === ws) {
        this.socket = null
      }

      if (this.activeToken === token) {
        this.activeToken = null
      }

      this.isConnecting = false

      if (event.code === 1008) {
        this.shouldReconnect = false
        return
      }

      if (this.shouldReconnect && this.activeToken === null) {
        this.scheduleReconnect(token)
      }
    }

    ws.onerror = (err) => {
      console.error("ws error", err)
    }
  }

  private scheduleReconnect(token: string) {
    if (this.reconnectTimeout) {
      return
    }

    const timeout = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)

    this.reconnectAttempts++

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null
      this.connect(token)
    }, timeout)
  }

  disconnect() {
    this.shouldReconnect = false

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    const socket = this.socket

    this.socket = null
    this.activeToken = null
    this.isConnecting = false

    socket?.close()
  }

  sendRaw(data: string | ArrayBuffer) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return
    }

    this.socket.send(data)
  }

  send<T extends keyof ClientEvents>(event: T, data: ClientEvents[T]) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return
    }

    this.socket.send(
      JSON.stringify({
        event,
        data,
      })
    )
  }

  on<T extends keyof ServerEvents>(
    event: T,
    callback: (payload: ServerEvents[T]) => void
  ) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)?.add(callback as EventHandler)
  }

  off<T extends keyof ServerEvents>(
    event: T,
    callback: (payload: ServerEvents[T]) => void
  ) {
    this.listeners.get(event)?.delete(callback as EventHandler)
  }

  private emitLocal<T extends keyof ServerEvents>(
    event: T,
    payload: ServerEvents[T]
  ) {
    this.listeners.get(event)?.forEach((handler) => {
      handler(payload)
    })
  }
}

export const wsClient = new WSClient()
