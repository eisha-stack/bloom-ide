import { AlertCircle, FolderOpen, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFileTreeFilter } from '../../hooks/useFileTreeFilter'
import { isTauri } from '../../lib/tauri'
import { useWorkspace } from '../../stores/workspaceStore'
import type { FileNode } from '../../types/ide'
import { FileSearch } from './FileSearch'
import { FileTree } from './FileTree'

type FileExplorerProps = {
  selectedId: string | null
  onSelectFile: (node: FileNode) => void
  onOpenFolder?: () => void
}

function ExplorerLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
      <Loader2 size={22} className="animate-spin text-[var(--bloom-lavender)]" />
      <p className="m-0 text-center text-[12px] text-[var(--text-muted)]">Loading workspace…</p>
    </div>
  )
}

function ExplorerError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="mx-3 my-4 rounded-[var(--radius-md)] border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] p-4">
      <div className="flex items-start gap-2.5">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[12px] font-medium text-red-300">Could not load folder</p>
          <p className="mt-1 mb-0 text-[11px] leading-relaxed text-[var(--text-muted)]">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-[var(--radius-sm)] border border-[rgba(248,113,113,0.3)] px-2.5 py-1 text-[11px] text-red-300 transition-colors hover:bg-[rgba(248,113,113,0.12)]"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}

function ExplorerEmpty({ onOpenFolder }: { onOpenFolder?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <FolderOpen size={28} className="text-[var(--bloom-lilac)] opacity-70" />
      <p className="m-0 text-[13px] text-[var(--text-secondary)]">No folder open</p>
      <p className="m-0 max-w-[180px] text-[11px] leading-relaxed text-[var(--text-muted)]">
        Open a local folder to browse and edit files.
      </p>
      {onOpenFolder && (
        <button
          type="button"
          onClick={onOpenFolder}
          className="mt-1 rounded-[var(--radius-md)] border border-[rgba(168,85,247,0.35)] bg-[rgba(168,85,247,0.12)] px-3 py-1.5 text-[12px] font-medium text-[var(--bloom-lilac)] transition-colors hover:bg-[rgba(168,85,247,0.2)]"
        >
          Open Folder
        </button>
      )}
    </div>
  )
}

export function FileExplorer({ selectedId, onSelectFile, onOpenFolder }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const {
    projectName,
    rootNodes,
    rootLoad,
    init,
    refreshRoot,
    loadFolder,
    getFolderLoad,
  } = useWorkspace()

  useEffect(() => {
    void init()
  }, [init])

  const filteredTree = useFileTreeFilter(rootNodes, searchQuery)
  const lazyLoad = isTauri()
  const isLoading = rootLoad.status === 'loading'
  const isEmpty =
    lazyLoad && rootLoad.status === 'idle' && rootNodes.length === 0 && !rootLoad.error

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 py-3">
        <h2 className="m-0 font-[family-name:var(--font-heading)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Explorer
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Refresh explorer"
            disabled={isLoading}
            onClick={() => void refreshRoot()}
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors duration-200 hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)] disabled:opacity-40"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : undefined} />
          </button>
        </div>
      </header>

      <FileSearch value={searchQuery} onChange={setSearchQuery} />

      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-3">
        <div className="glass-panel mx-2 p-1.5">
          <p className="m-0 px-2 py-1.5 font-[family-name:var(--font-heading)] text-[12px] font-semibold text-[var(--text-primary)]">
            {projectName}
          </p>

          {rootLoad.status === 'error' && (
            <ExplorerError message={rootLoad.error ?? 'Unknown error'} onRetry={() => void refreshRoot()} />
          )}

          {isLoading && <ExplorerLoading />}

          {isEmpty && !isLoading && <ExplorerEmpty onOpenFolder={onOpenFolder} />}

          {!isLoading && !isEmpty && rootLoad.status !== 'error' && (
            <FileTree
              nodes={filteredTree}
              selectedId={selectedId}
              searchQuery={searchQuery}
              lazyLoad={lazyLoad}
              getFolderLoad={getFolderLoad}
              onLoadFolder={(node) => void loadFolder(node.id)}
              onSelect={onSelectFile}
            />
          )}

          {!isLoading &&
            !isEmpty &&
            rootLoad.status === 'loaded' &&
            rootNodes.length === 0 &&
            lazyLoad && (
              <p className="px-4 py-6 text-center text-[12px] text-[var(--text-muted)]">
                This folder is empty
              </p>
            )}

          {!isLoading &&
            !isEmpty &&
            rootLoad.status !== 'error' &&
            rootNodes.length > 0 &&
            filteredTree.length === 0 && (
            <p className="px-4 py-6 text-center text-[12px] text-[var(--text-muted)]">
              No files match your search
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
