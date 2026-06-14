type PanelResizeHandleProps = {
  panelHeight: number
  onResize: (height: number) => void
}

export function PanelResizeHandle({ panelHeight, onResize }: PanelResizeHandleProps) {
  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startY = event.clientY
    const startHeight = panelHeight

    const onMouseMove = (moveEvent: MouseEvent) => {
      onResize(startHeight + (startY - moveEvent.clientY))
    }

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize terminal panel"
      onMouseDown={onMouseDown}
      className="group relative z-10 h-1 shrink-0 cursor-row-resize bg-[var(--border-subtle)] transition-colors hover:bg-[var(--bloom-lavender)]"
    >
      <div className="absolute inset-x-8 -top-1 h-3" />
    </div>
  )
}
