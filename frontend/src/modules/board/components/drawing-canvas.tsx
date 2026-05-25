import { useEffect, useRef } from "react"
import { Application } from "@pixi/react"
import * as PIXI from "pixi.js"

interface DrawingCanvasProps {
  containerRef: React.MutableRefObject<PIXI.Container | null>
  children?: React.ReactNode
}

export function DrawingCanvas({ containerRef, children }: DrawingCanvasProps) {
  const appDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create a container in the next frame to ensure the Application is mounted
    const timer = setTimeout(() => {
      if (appDivRef.current) {
        // Find the canvas element and get the PIXI instance
        const canvas = appDivRef.current.querySelector(
          "canvas"
        ) as HTMLCanvasElement
        if (canvas && (canvas as any).__PIXI_APP__) {
          const app = (canvas as any).__PIXI_APP__
          containerRef.current = app.stage
        } else {
          // Fallback: create a new container
          const container = new PIXI.Container()
          containerRef.current = container
        }
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [containerRef])

  return (
    <div ref={appDivRef} className="h-full w-full">
      <Application className="h-full w-full" antialias={true}>
        {children}
      </Application>
    </div>
  )
}
