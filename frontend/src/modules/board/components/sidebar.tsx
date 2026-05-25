import {
  Home,
  Pointer,
  Hand,
  Square,
  Circle,
  Type,
  LineChart,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { type Tool, useWhiteboardStore } from "../../../store/whiteboard.store"
import { cn } from "../../../lib/utils"

const TOOLS = [
  { id: "pointer" as Tool, icon: Pointer, label: "Pointer", shortcut: "V" },
  { id: "hand" as Tool, icon: Hand, label: "Hand", shortcut: "H" },
]

const SHAPES = [
  {
    id: "rectangle" as Tool,
    icon: Square,
    label: "Rectangle",
    shortcut: "R",
  },
  { id: "circle" as Tool, icon: Circle, label: "Circle", shortcut: "C" },
  { id: "line" as Tool, icon: LineChart, label: "Line", shortcut: "L" },
  { id: "text" as Tool, icon: Type, label: "Text", shortcut: "T" },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { selectedTool, setSelectedTool } = useWhiteboardStore()

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool)
  }

  return (
    <div className="flex h-screen w-18 flex-col border-r border-border bg-card">
      {/* Home Button */}
      <div className="border-b border-border p-2">
        <button
          onClick={() => navigate("/")}
          className="flex h-12 w-12 items-center justify-center rounded-lg hover:bg-accent"
          title="Home"
        >
          <Home className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      {/* Tools Section */}
      <div className="border-b border-border p-2">
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
          TOOLS
        </div>
        <div className="space-y-1">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                  selectedTool === tool.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Shapes Section */}
      <div className="flex-1 p-2">
        <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
          SHAPES
        </div>
        <div className="space-y-1">
          {SHAPES.map((shape) => {
            const Icon = shape.icon
            return (
              <button
                key={shape.id}
                onClick={() => handleToolClick(shape.id)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                  selectedTool === shape.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
                title={`${shape.label} (${shape.shortcut})`}
              >
                <Icon className="h-5 w-5" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="border-t border-border p-2 text-xs text-muted-foreground">
        <div className="rounded bg-secondary/50 p-2 text-center">
          <div className="font-semibold">⌨️</div>
          <div className="mt-1 text-[10px]">Shortcuts</div>
        </div>
      </div>
    </div>
  )
}
