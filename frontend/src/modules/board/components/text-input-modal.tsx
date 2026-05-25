import { useState, useEffect, useRef } from "react"

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
  showTextModal,
}: TextInputModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showTextModal) return

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [showTextModal])

  const handleSubmit = () => {
    onSubmit(inputRef.current?.value || "")
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="rounded-lg bg-white p-4 shadow-lg"
        style={{
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          // value={text}
          // onChange={(e) => (inputRef.current!.value = e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text..."
          // autoFocus
          className="w-48 rounded border border-gray-300 px-2 py-1 text-black"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            Add
          </button>
          <button
            onClick={onCancel}
            className="rounded bg-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
