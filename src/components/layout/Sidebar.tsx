import { GitBranch, Puzzle } from 'lucide-react'
import type { ActivityView, FileNode } from '../../types/ide'
import { FileExplorer } from '../explorer/FileExplorer'
import { PlaceholderPanel } from '../panels/PlaceholderPanel'
import { SearchPanel } from '../panels/SearchPanel'
import { SettingsPanel } from '../panels/SettingsPanel'

type SidebarProps = {
  activeView: ActivityView
  selectedFileId: string | null
  onSelectFile: (node: FileNode) => void
  onOpenFolder?: () => void
}

export function Sidebar({ activeView, selectedFileId, onSelectFile, onOpenFolder }: SidebarProps) {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)]">
      {activeView === 'explorer' && (
        <FileExplorer
          selectedId={selectedFileId}
          onSelectFile={onSelectFile}
          onOpenFolder={onOpenFolder}
        />
      )}
      {activeView === 'search' && <SearchPanel />}
      {activeView === 'scm' && (
        <PlaceholderPanel
          title="Source Control"
          description="Track changes and commit with a calm, focused workflow."
          icon={GitBranch}
        />
      )}
      {activeView === 'extensions' && (
        <PlaceholderPanel
          title="Extensions"
          description="Discover plugins to personalize your Bloom workspace."
          icon={Puzzle}
        />
      )}
      {activeView === 'settings' && <SettingsPanel />}
    </aside>
  )
}
