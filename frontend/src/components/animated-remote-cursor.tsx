import { useTick } from "@pixi/react"
import { useRef } from "react"
import { RemoteCursor } from "./remote-cursor"

type Props = {
  x: number
  y: number
  name: string
}

export function AnimatedCursor({ x: targetX, y: targetY, name }: Props) {
  const containerRef = useRef(null)

  const current = useRef({
    x: targetX,
    y: targetY,
  })

  useTick((ticker) => {
    if (!containerRef.current) return

    const lerpFactor = 0.22 * ticker.deltaTime

    current.current.x += (targetX - current.current.x) * lerpFactor

    current.current.y += (targetY - current.current.y) * lerpFactor

    containerRef.current.x = current.current.x
    containerRef.current.y = current.current.y
  })

  return (
    <pixiContainer ref={containerRef}>
      <RemoteCursor x={0} y={0} name={name} />
    </pixiContainer>
  )
}
