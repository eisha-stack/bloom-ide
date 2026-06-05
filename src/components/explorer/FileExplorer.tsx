import { useState } from 'react'
import { MoreHorizontal, RefreshCw } from 'lucide-react'
import { mockFileTree } from '../../data/mockFileTree'
import { useFileTreeFilter } from '../../hooks/useFileTreeFilter'
import type { FileNode } from '../../types/ide'
import { FileSearch } from './FileSearch'
import { FileTree } from './FileTree'

type FileExplorerProps = {
  selectedId: string | null
  onSelectFile: (node: FileNode) => void
}

export function FileExplorer({ selectedId, onSelectFile }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const filteredTree = useFileTreeFilter(mockFileTree, searchQuery)

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 py-3">
        <h2
          className="m-0 font-[family-name:var(--font-heading)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
        >
          Explorer
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Refresh explorer"
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors duration-200 hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)]"
          >
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            aria-label="More actions"
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors duration-200 hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)]"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </header>

      <FileSearch value={searchQuery} onChange={setSearchQuery} />

      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-3">
        <div className="glass-panel mx-2 p-1.5">
          <p className="m-0 px-2 py-1.5 font-[family-name:var(--font-heading)] text-[12px] font-semibold text-[var(--bloom-lilac)]">
            bloom-ide
          </p>
          <FileTree
            nodes={filteredTree}
            selectedId={selectedId}
            searchQuery={searchQuery}
            onSelect={onSelectFile}
          />
        </div>
      </div>
    </div>
  )
}
