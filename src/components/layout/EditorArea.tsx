import { MonacoEditorPane } from '../editor/MonacoEditorPane'
import { LandingEmptyState } from '../landing/LandingEmptyState'
import type { LandingActionId } from '../landing/landingActions'

type EditorAreaProps = {
  fileName: string | null
  language: string | null
  content: string
  onChange: (value: string) => void
  onCursorChange?: (line: number, column: number) => void
  onLandingAction?: (action: LandingActionId) => void
}

export function EditorArea({
  fileName,
  language,
  content,
  onChange,
  onCursorChange,
  onLandingAction,
}: EditorAreaProps) {
  if (!fileName || !language) {
    return <LandingEmptyState onAction={(action) => onLandingAction?.(action)} />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-editor)]">
      <MonacoEditorPane
        value={content}
        language={language}
        onChange={onChange}
        onCursorChange={onCursorChange}
      />
    </div>
  )
}
