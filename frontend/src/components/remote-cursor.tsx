import { TextStyle, Text, Assets, Sprite } from "pixi.js"
import { extend } from "@pixi/react"
import { useEffect, useState } from "react"
import { getRandomCursorColor } from "../modules/board/hooks/shape-drawing.util"

extend({ TextStyle, Text, Sprite })

type CursorProps = {
  x: number
  y: number
  name: string
  color?: string
}

const textStyle = new TextStyle({
  fill: "#ffffff",
  fontSize: 12,
  fontWeight: "600",
  fontFamily: "Inter, sans-serif",
})

export const CURSOR_TIP_OFFSET = 4

function createCursorSVG(color: string) {
  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="${color}"
    stroke="white"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/>
  </svg>
  `
}
const cursorColor = getRandomCursorColor()
export function RemoteCursor({ x, y, name, color = cursorColor }: CursorProps) {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    const load = async () => {
      const svg = createCursorSVG(color)

      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)

      const texture = await Assets.load(url)

      setTexture(texture)
    }

    load()
  }, [color])

  if (!texture) return null

  const labelWidth = Math.max(name.length * 7 + 14, 40)
  return (
    <pixiContainer x={x + 35} y={y + 35}>
      {/* Cursor */}
      <pixiSprite
        x={-CURSOR_TIP_OFFSET}
        y={-CURSOR_TIP_OFFSET}
        texture={texture}
        width={22}
        height={22}
      />

      {/* Label Background */}
      <pixiGraphics
        x={18}
        y={18}
        draw={(g) => {
          g.clear()
          g.roundRect(0, 0, labelWidth, 24, 6)
          g.fill(color)
        }}
      />

      {/* Label Text */}
      <pixiText x={28} y={23} text={name} anchor={0} style={textStyle} />
    </pixiContainer>
  )
}
