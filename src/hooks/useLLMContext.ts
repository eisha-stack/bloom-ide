import { useMemo } from 'react'
import { collectLLMContext, summarizeLLMContext } from '../lib/ai/context'
import { useEditorStore } from '../stores/editorStore'
import { useWorkspaceStore } from '../stores/workspaceStore'

/** Reactive IDE context for the AI panel UI. Snapshot is re-collected at send time. */
export function useLLMContext() {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const rootNodes = useWorkspaceStore((s) => s.rootNodes)
  const workspacePath = useWorkspaceStore((s) => s.workspacePath)
  const projectName = useWorkspaceStore((s) => s.projectName)

  const context = useMemo(
    () => collectLLMContext(),
    [tabs, activeTabId, rootNodes, workspacePath, projectName],
  )

  const summary = useMemo(() => summarizeLLMContext(context), [context])

  return { context, summary }
}
