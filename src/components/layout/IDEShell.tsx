import { useCallback, useState } from 'react'
import { EditorProvider, useEditor, languageLabel } from '../../editor'
import type { LandingActionId } from '../landing/landingActions'
import { mockFileContents, mockFileTree } from '../../data/mockFileTree'
import type { ActivityView } from '../../types/ide'
import { findFileById } from '../../utils/findFileById'
import { AIAssistantPanel } from '../ai/AIAssistantPanel'
import { ActivityBar } from './ActivityBar'
import { EditorArea } from './EditorArea'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { TabBar } from './TabBar'
import { TopNavBar } from './TopNavBar'

function getFileContent(fileId: string, _fileName: string): string {
  return mockFileContents[fileId] ?? `// ${_fileName}\n`
}

function IDEShellInner() {
  const [activeView, setActiveView] = useState<ActivityView>('explorer')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const { tabs, activeTabId, activeTab, openFile, closeTab, selectTab } = useEditor()

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
          setActiveView('explorer')
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
    [openFile],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <TopNavBar projectName="bloom-ide" branch="main" />

      <div className="flex min-h-0 flex-1">
        <ActivityBar
          active={activeView}
          aiActive={aiPanelOpen}
          onChange={handleActivityChange}
        />

        <Sidebar
          activeView={activeView}
          selectedFileId={activeTabId}
          onSelectFile={openFile}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelect={selectTab}
            onClose={closeTab}
          />
          <EditorArea onLandingAction={handleLandingAction} />
          <StatusBar
            language={activeTab ? languageLabel(activeTab.language) : null}
            line={activeTab?.cursor.line ?? 1}
            column={activeTab?.cursor.column ?? 1}
          />
        </div>

        <AIAssistantPanel
          open={aiPanelOpen}
          onClose={() => setAiPanelOpen(false)}
          activeFileName={activeTab?.name}
        />
      </div>
    </div>
  )
}

export function IDEShell() {
  return (
    <EditorProvider getFileContent={getFileContent}>
      <IDEShellInner />
    </EditorProvider>
  )
}
