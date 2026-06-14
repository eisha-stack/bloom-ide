import { AlertCircle, Loader2 } from 'lucide-react'
import { MonacoEditor } from '../../editor/MonacoEditor'
import { useEditor } from '../../editor/useEditor'
import { LandingEmptyState } from '../landing/LandingEmptyState'
import type { LandingActionId } from '../landing/landingActions'

type EditorAreaProps = {
  onLandingAction?: (action: LandingActionId) => void
}

function EditorErrorBanner({
  message,
  onDismiss,
}: {
  message: string
  onDismiss: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] px-4 py-2">
      <AlertCircle size={14} className="shrink-0 text-red-400" />
      <p className="m-0 min-w-0 flex-1 truncate text-[12px] text-red-300">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
      >
        Dismiss
      </button>
    </div>
  )
}

function OpeningFileHint({ fileName }: { fileName?: string }) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 px-3 py-1.5 text-[12px] text-[var(--text-secondary)] shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <Loader2 size={14} className="animate-spin text-[var(--bloom-lavender)]" />
      Opening{fileName ? ` ${fileName}` : ' file'}…
    </div>
  )
}

export function EditorArea({ onLandingAction }: EditorAreaProps) {
  const { activeTab, openingFileId, openFileError, saveError, clearOpenFileError, clearSaveError } =
    useEditor()

  const editorError = openFileError ?? saveError
  const dismissError = openFileError ? clearOpenFileError : clearSaveError

  if (!activeTab) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {openingFileId && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[var(--bg-main)]">
            <Loader2 size={24} className="animate-spin text-[var(--bloom-lavender)]" />
            <p className="m-0 text-[13px] text-[var(--text-secondary)]">Opening file…</p>
          </div>
        )}
        {editorError && (
          <div className="absolute inset-x-0 top-0 z-20 px-4 pt-4">
            <EditorErrorBanner message={editorError} onDismiss={dismissError} />
          </div>
        )}
        {!openingFileId && (
          <LandingEmptyState onAction={(action) => onLandingAction?.(action)} />
        )}
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {editorError && <EditorErrorBanner message={editorError} onDismiss={dismissError} />}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <MonacoEditor />
        {openingFileId && openingFileId !== activeTab.id && (
          <OpeningFileHint fileName={openingFileId.split('/').pop()} />
        )}
      </div>
    </div>
  )
}
