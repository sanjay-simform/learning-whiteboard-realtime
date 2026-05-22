import { useEffect, type ReactNode } from "react"
import { useAuth } from "../context/Auth.context"
import { wsClient } from "./ws-client"

export function WSProvider({ children }: { children?: ReactNode }) {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) {
      return
    }

    const token = localStorage.getItem("access_token")

    if (!user || !token) {
      wsClient.disconnect()
      return
    }

    wsClient.connect(token)
  }, [isLoading, user])

  return <>{children}</>
}
