import { useEffect, useRef } from "react"
import { Check, X } from "lucide-react"

interface TextInputModalProps {
  x: number
  y: number
  onSubmit: (text: string) => void
  onCancel: () => void
  showTextModal: boolean
}

export function TextInputModal({
  x,
  y,
  onSubmit,
  onCancel,
}: TextInputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  const handleSubmit = () => {
    const value = inputRef.current?.value.trim() || ""
    if (!value) return

    onSubmit(value)
    inputRef.current!.value = ""
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-transparent" onMouseDown={onCancel}>
      <div
        className="board-popover-enter rounded-[8px] border border-black/10 bg-white/94 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          position: "absolute",
          left: `clamp(1rem, ${x}px, calc(100vw - 18rem))`,
          top: `clamp(1rem, ${y}px, calc(100vh - 8rem))`,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          placeholder="Type text"
          className="h-10 w-56 rounded-[8px] border border-input bg-background px-3 text-sm font-medium text-foreground shadow-inner transition outline-none focus:border-primary focus:ring-4 focus:ring-primary/12"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={handleSubmit}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-foreground text-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            title="Add text"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-black/5 bg-white text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:scale-95"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
