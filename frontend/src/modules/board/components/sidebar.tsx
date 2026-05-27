import {
  Home,
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  Minus,
  Keyboard,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { type Tool, useWhiteboardStore } from "../../../store/whiteboard.store"
import { cn } from "../../../lib/utils"

const TOOLS = [
  {
    id: "pointer" as Tool,
    icon: MousePointer2,
    label: "Pointer",
    shortcut: "V",
  },
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
  { id: "line" as Tool, icon: Minus, label: "Line", shortcut: "L" },
  { id: "text" as Tool, icon: Type, label: "Text", shortcut: "T" },
]

type ToolItem = (typeof TOOLS | typeof SHAPES)[number]

function ToolButton({
  item,
  isSelected,
  onClick,
}: {
  item: ToolItem
  isSelected: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      aria-pressed={isSelected}
      className={cn(
        "group relative flex h-11 w-11 items-center justify-center rounded-[8px] transition-all duration-200 ease-out active:scale-95",
        isSelected
          ? "bg-foreground text-background shadow-[0_12px_28px_rgba(15,23,42,0.22)]"
          : "text-muted-foreground hover:-translate-y-0.5 hover:bg-white hover:text-foreground hover:shadow-[0_10px_24px_rgba(15,23,42,0.10)]"
      )}
      title={`${item.label} (${item.shortcut})`}
    >
      <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
      {isSelected && (
        <span className="absolute top-1/2 -right-1 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />
      )}
    </button>
  )
}

export function Sidebar() {
  const navigate = useNavigate()
  const { selectedTool, setSelectedTool } = useWhiteboardStore()

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool)
  }

  return (
    <aside className="board-sidebar-enter z-30 flex h-screen w-[76px] shrink-0 flex-col items-center border-r border-white/75 bg-white/86 px-2 py-3 shadow-[8px_0_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex w-full justify-center pb-3">
        <button
          onClick={() => navigate("/")}
          aria-label="Home"
          className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-foreground text-background shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.24)] active:scale-95"
          title="Home"
        >
          <Home className="h-5 w-5" />
        </button>
      </div>

      <div className="h-px w-10 bg-border/80" />

      <div
        className="flex w-full flex-col items-center gap-1.5 py-3"
        aria-label="Tools"
      >
        {TOOLS.map((tool) => (
          <ToolButton
            key={tool.id}
            item={tool}
            isSelected={selectedTool === tool.id}
            onClick={() => handleToolClick(tool.id)}
          />
        ))}
      </div>

      <div className="h-px w-10 bg-border/80" />

      <div
        className="flex w-full flex-1 flex-col items-center gap-1.5 py-3"
        aria-label="Shapes"
      >
        {SHAPES.map((shape) => (
          <ToolButton
            key={shape.id}
            item={shape}
            isSelected={selectedTool === shape.id}
            onClick={() => handleToolClick(shape.id)}
          />
        ))}
      </div>

      <div className="mt-auto flex w-full justify-center pt-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-black/5 bg-white text-muted-foreground shadow-sm"
          title="Keyboard shortcuts"
        >
          <Keyboard className="h-4.5 w-4.5" />
        </div>
      </div>
    </aside>
  )
}
