import * as PIXI from "pixi.js"

export interface ShapeConfig {
  color?: number
  lineWidth?: number
  fillAlpha?: number
}

export function drawRectangle(
  stage: PIXI.Container,
  x: number,
  y: number,
  width: number,
  height: number,
  config: ShapeConfig = {}
) {
  const { color = 0x000000, fillAlpha = 0 } = config

  const rectangle = new PIXI.Graphics()
  rectangle.rect(x, y, width, height)
  rectangle.fill({
    color,
    alpha: fillAlpha,
  })

  stage.addChild(rectangle)
  return rectangle
}

export function drawCircle(
  stage: PIXI.Container,
  x: number,
  y: number,
  radius: number,
  config: ShapeConfig = {}
) {
  const { color = 0x000000, lineWidth = 2, fillAlpha = 0 } = config

  const circle = new PIXI.Graphics()
  circle.lineStyle(lineWidth, color, 1)
  if (fillAlpha > 0) {
    circle.beginFill(color, fillAlpha)
  }
  circle.drawCircle(x, y, radius)
  if (fillAlpha > 0) {
    circle.endFill()
  }

  stage.addChild(circle)
  return circle
}

export function drawLine(
  stage: PIXI.Container,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  config: ShapeConfig = {}
) {
  const { color = 0x000000, lineWidth = 2 } = config

  const line = new PIXI.Graphics()
  line.lineStyle(lineWidth, color, 1)
  line.moveTo(x1, y1)
  line.lineTo(x2, y2)

  stage.addChild(line)
  return line
}

export function drawText(
  stage: PIXI.Container,
  text: string,
  x: number,
  y: number,
  fontSize: number = 16
) {
  const textObj = new PIXI.Text({
    text,
    style: {
      fontSize,
      // black color for better visibility on white background, can be customized
      fill: "#000000",
      fontFamily: "Arial",
    },
  })

  textObj.x = x
  textObj.y = y

  stage.addChild(textObj)
  return textObj
}

export interface ShapeData {
  type: "rectangle" | "circle" | "line" | "text"
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  text?: string
}

/**
 * Draws a shape on the stage based on the shape data received from events
 * @param stage - The PIXI Container/stage to draw on
 * @param shapeData - The shape data containing type and coordinates
 * @param config - Optional shape configuration (color, lineWidth, fillAlpha)
 */
export function drawShapeFromEvent(
  stage: PIXI.Container,
  shapeData: ShapeData,
  config: ShapeConfig = {}
) {
  const { type, x, y } = shapeData

  switch (type) {
    case "rectangle":
      if (shapeData.width !== undefined && shapeData.height !== undefined) {
        return drawRectangle(stage, x, y, shapeData.width, shapeData.height, {
          ...config,
        })
      }
      break

    case "circle":
      if (shapeData.radius !== undefined) {
        return drawCircle(stage, x, y, shapeData.radius, {
          ...{ color: 0x000000, lineWidth: 2, fillAlpha: 0 },
          ...config,
        })
      }
      break

    case "line": {
      // For line, we need x2, y2 which should be derived from width, height
      const x2 = shapeData.width !== undefined ? x + shapeData.width : x
      const y2 = shapeData.height !== undefined ? y + shapeData.height : y
      return drawLine(stage, x, y, x2, y2, {
        ...{ color: 0x000000, lineWidth: 2 },
        ...config,
      })
    }

    case "text":
      if (shapeData.text !== undefined) {
        return drawText(stage, shapeData.text, x, y)
      }
      break
  }

  console.warn("Invalid shape data:", shapeData)
  return null
}
