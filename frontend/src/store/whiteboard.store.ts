import { create } from "zustand"

export type Tool = "pointer" | "hand" | "rectangle" | "circle" | "line" | "text"

interface WhiteboardStore {
  selectedTool: Tool
  setSelectedTool: (tool: Tool) => void
  isDrawing: boolean
  setIsDrawing: (drawing: boolean) => void
}

export const useWhiteboardStore = create<WhiteboardStore>((set) => ({
  selectedTool: "pointer",
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  isDrawing: false,
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
}))
