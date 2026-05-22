// hooks/use-ws-event.ts

import { useEffect } from "react"

import { wsClient } from "../socket/ws-client"
import type { ServerEvents } from "../socket/ws-events.type"

export function useWSEvent<T extends keyof ServerEvents>(
  event: T,
  callback: (payload: ServerEvents[T]) => void
) {
  useEffect(() => {
    wsClient.on(event, callback)

    return () => {
      wsClient.off(event, callback)
    }
  }, [event, callback])
}
