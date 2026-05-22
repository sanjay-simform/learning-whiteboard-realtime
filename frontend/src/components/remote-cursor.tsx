import { motion } from "motion/react"
import { MousePointer2 } from "lucide-react"

type CursorProps = {
  x: number
  y: number
  name: string
  color?: string
}

export function RemoteCursor({ x, y, name, color = "#3b82f6" }: CursorProps) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 left-0 z-50"
      animate={{
        x,
        y,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 400,
        mass: 0.5,
      }}
    >
      <div className="relative">
        <MousePointer2
          size={22}
          fill={color}
          stroke="white"
          strokeWidth={1.5}
          className="drop-shadow-sm"
        />

        <div
          className="absolute top-5 left-5 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-md"
          style={{
            backgroundColor: color,
          }}
        >
          {name}
        </div>
      </div>
    </motion.div>
  )
}
