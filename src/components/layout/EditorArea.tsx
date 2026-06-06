import { MonacoEditor } from '../../editor/MonacoEditor'
import { useEditor } from '../../editor/useEditor'
import { LandingEmptyState } from '../landing/LandingEmptyState'
import type { LandingActionId } from '../landing/landingActions'

type EditorAreaProps = {
  onLandingAction?: (action: LandingActionId) => void
}

export function EditorArea({ onLandingAction }: EditorAreaProps) {
  const { activeTab } = useEditor()

  if (!activeTab) {
    return <LandingEmptyState onAction={(action) => onLandingAction?.(action)} />
  }

  return <MonacoEditor />
}
