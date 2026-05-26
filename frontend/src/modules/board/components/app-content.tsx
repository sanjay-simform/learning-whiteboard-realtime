import { AnimatedCursor } from "../../../components/animated-remote-cursor"

type CursorPayload = {
  x: number
  y: number
  userId: number
}

interface AppContentProps {
  cursors: Record<number, CursorPayload>
}

export function AppContent({ cursors }: AppContentProps) {
  return (
    <pixiContainer zIndex={1000}>
      {Object.values(cursors).map((cursor) => (
        <AnimatedCursor
          key={cursor.userId}
          x={cursor.x}
          y={cursor.y}
          name={`User ${cursor.userId}`}
        />
      ))}
    </pixiContainer>
  )
}
