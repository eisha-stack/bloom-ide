import { useCallback, useEffect, useState } from 'react'
import { useEditor, languageLabel } from '../../editor'
import { TerminalPanel } from '../terminal/TerminalPanel'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useEditorShortcuts } from '../../hooks/useEditorShortcuts'
import { useTerminalShortcuts } from '../../hooks/useTerminalShortcuts'
import type { LandingActionId } from '../landing/landingActions'
import { mockFileTree } from '../../data/mockFileTree'
import type { ActivityView, FileNode } from '../../types/ide'
import { findFileById } from '../../utils/findFileById'
import { isTauri } from '../../lib/tauri'
import { useWorkspace } from '../../stores/workspaceStore'
import { useScm } from '../../stores/scmStore'
import { AIAssistantPanel } from '../ai/AIAssistantPanel'
import { ActivityBar } from './ActivityBar'
import { EditorArea } from './EditorArea'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { TabBar } from './TabBar'
import { TopNavBar } from './TopNavBar'

export function IDEShell() {
  const [activeView, setActiveView] = useState<ActivityView>('explorer')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const { activeTabId, activeTab, openFile, openFileAsync, saveStatus } = useEditor()
  const { projectName, openWorkspace, workspacePath } = useWorkspace()
  const { changeCount, refresh: refreshScm, status: scmStatus } = useScm()

  useEditorShortcuts()
  useAutoSave()
  useTerminalShortcuts()

  useEffect(() => {
    void refreshScm()
  }, [workspacePath, refreshScm])

  useEffect(() => {
    if (activeView === 'scm') {
      void refreshScm()
    }
  }, [activeView, refreshScm])

  const handleOpenFolder = useCallback(async () => {
    await openWorkspace()
    setActiveView('explorer')
  }, [openWorkspace])

  const handleSelectFile = useCallback(
    (node: FileNode) => {
      void openFileAsync(node)
    },
    [openFileAsync],
  )

  const handleActivityChange = useCallback((view: ActivityView) => {
    if (view === 'ai') {
      setAiPanelOpen((open) => !open)
      return
    }
    setActiveView(view)
  }, [])

  const handleLandingAction = useCallback(
    (action: LandingActionId) => {
      switch (action) {
        case 'new-project': {
          const file = findFileById(mockFileTree, 'app-tsx')
          if (file) openFile(file)
          break
        }
        case 'open-folder':
          if (isTauri()) {
            void handleOpenFolder()
          } else {
            setActiveView('explorer')
          }
          break
        case 'clone': {
          const file = findFileById(mockFileTree, 'readme')
          if (file) openFile(file)
          break
        }
        case 'continue-ai':
          setAiPanelOpen(true)
          break
      }
    },
    [openFile, handleOpenFolder],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <TopNavBar projectName={projectName} branch={scmStatus?.branch ?? undefined} />

      <div className="flex min-h-0 flex-1">
        <ActivityBar
          active={activeView}
          aiActive={aiPanelOpen}
          onChange={handleActivityChange}
          scmBadge={changeCount}
        />

        <Sidebar
          activeView={activeView}
          selectedFileId={activeTabId}
          onSelectFile={handleSelectFile}
          onOpenFolder={() => void handleOpenFolder()}
        />

        <div className="flex min-w-0 flex-1 flex-col min-h-0 overflow-hidden">
          <TabBar />
          <EditorArea onLandingAction={handleLandingAction} />
          <TerminalPanel />
          <StatusBar
            language={activeTab ? languageLabel(activeTab.language) : null}
            line={activeTab?.cursor.line ?? 1}
            column={activeTab?.cursor.column ?? 1}
            saveStatus={saveStatus}
            isDirty={activeTab?.isDirty ?? false}
          />
        </div>

        <AIAssistantPanel open={aiPanelOpen} onClose={() => setAiPanelOpen(false)} />
      </div>
    </div>
  )
}
