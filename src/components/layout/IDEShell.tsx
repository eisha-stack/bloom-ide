import { useCallback, useMemo, useState } from 'react'
import type { LandingActionId } from '../landing/landingActions'
import { mockFileContents, mockFileTree } from '../../data/mockFileTree'
import type { ActivityView, FileNode, OpenTab } from '../../types/ide'
import { findFileById } from '../../utils/findFileById'
import { AIAssistantPanel } from '../ai/AIAssistantPanel'
import { ActivityBar } from './ActivityBar'
import { EditorArea } from './EditorArea'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { TabBar } from './TabBar'
import { TopNavBar } from './TopNavBar'

function fileToTab(node: FileNode): OpenTab {
  return {
    id: node.id,
    name: node.name,
    language: node.language ?? 'plaintext',
    content: mockFileContents[node.id] ?? `// ${node.name}\n`,
  }
}

export function IDEShell() {
  const [activeView, setActiveView] = useState<ActivityView>('explorer')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [cursor, setCursor] = useState({ line: 1, column: 1 })

  const activeTab = useMemo(
    () => openTabs.find((tab) => tab.id === activeTabId) ?? null,
    [openTabs, activeTabId],
  )

  const openFileNode = useCallback((node: FileNode) => {
    if (node.type !== 'file') return

    const tab = fileToTab(node)
    setOpenTabs((prev) => {
      if (prev.some((t) => t.id === tab.id)) return prev
      return [...prev, tab]
    })
    setActiveTabId(tab.id)
  }, [])

  const handleActivityChange = useCallback((view: ActivityView) => {
    if (view === 'ai') {
      setAiPanelOpen((open) => !open)
      return
    }
    setActiveView(view)
  }, [])

  const handleSelectFile = useCallback(
    (node: FileNode) => openFileNode(node),
    [openFileNode],
  )

  const handleCloseTab = useCallback(
    (id: string) => {
      setOpenTabs((prev) => {
        const next = prev.filter((tab) => tab.id !== id)
        if (activeTabId === id) {
          const closedIndex = prev.findIndex((tab) => tab.id === id)
          const fallback = next[closedIndex] ?? next[closedIndex - 1] ?? null
          setActiveTabId(fallback?.id ?? null)
        }
        return next
      })
    },
    [activeTabId],
  )

  const handleContentChange = useCallback(
    (value: string) => {
      if (!activeTabId) return
      setOpenTabs((prev) =>
        prev.map((tab) => (tab.id === activeTabId ? { ...tab, content: value } : tab)),
      )
    },
    [activeTabId],
  )

  const handleLandingAction = useCallback(
    (action: LandingActionId) => {
      switch (action) {
        case 'new-project': {
          const file = findFileById(mockFileTree, 'app-tsx')
          if (file) openFileNode(file)
          break
        }
        case 'open-folder':
          setActiveView('explorer')
          break
        case 'clone': {
          const file = findFileById(mockFileTree, 'readme')
          if (file) openFileNode(file)
          break
        }
        case 'continue-ai':
          setAiPanelOpen(true)
          break
      }
    },
    [openFileNode],
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
          onSelectFile={handleSelectFile}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TabBar
            tabs={openTabs}
            activeTabId={activeTabId}
            onSelect={setActiveTabId}
            onClose={handleCloseTab}
          />
          <EditorArea
            fileName={activeTab?.name ?? null}
            language={activeTab?.language ?? null}
            content={activeTab?.content ?? ''}
            onChange={handleContentChange}
            onCursorChange={(line, column) => setCursor({ line, column })}
            onLandingAction={handleLandingAction}
          />
          <StatusBar
            language={activeTab?.language}
            line={cursor.line}
            column={cursor.column}
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
