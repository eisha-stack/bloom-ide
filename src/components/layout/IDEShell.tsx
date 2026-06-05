import { useCallback, useMemo, useState } from 'react'
import { mockFileContents } from '../../data/mockFileTree'
import type { ActivityView, FileNode, OpenTab } from '../../types/ide'
import { ActivityBar } from './ActivityBar'
import { EditorArea } from './EditorArea'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { TabBar } from './TabBar'

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
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  const activeTab = useMemo(
    () => openTabs.find((tab) => tab.id === activeTabId) ?? null,
    [openTabs, activeTabId],
  )

  const handleSelectFile = useCallback((node: FileNode) => {
    if (node.type !== 'file') return

    const tab = fileToTab(node)
    setOpenTabs((prev) => {
      if (prev.some((t) => t.id === tab.id)) return prev
      return [...prev, tab]
    })
    setActiveTabId(tab.id)
  }, [])

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

  return (
    <div className="flex h-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      <ActivityBar active={activeView} onChange={setActiveView} />

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
        />
        <StatusBar language={activeTab?.language} />
      </div>
    </div>
  )
}
