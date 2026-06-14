import { useState } from 'react'
import {
  AlertCircle,
  ChevronRight,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import type { LoadStatus } from '../../stores/workspaceStore'
import type { FileNode } from '../../types/ide'

type FolderLoadState = {
  status: LoadStatus
  error: string | null
}

type FileTreeItemProps = {
  node: FileNode
  depth: number
  selectedId: string | null
  searchQuery: string
  lazyLoad?: boolean
  getFolderLoad?: (folderId: string) => FolderLoadState
  onLoadFolder?: (node: FileNode) => void
  onSelect: (node: FileNode) => void
  defaultExpanded?: boolean
}

function getFileIcon(name: string) {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return FileCode2
  if (name.endsWith('.json')) return FileJson
  return FileText
}

function highlightName(name: string, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return name

  const index = name.toLowerCase().indexOf(q)
  if (index === -1) return name

  return (
    <>
      {name.slice(0, index)}
      <mark className="rounded bg-[rgba(255,200,221,0.25)] px-0.5 text-inherit">
        {name.slice(index, index + q.length)}
      </mark>
      {name.slice(index + q.length)}
    </>
  )
}

export function FileTreeItem({
  node,
  depth,
  selectedId,
  searchQuery,
  lazyLoad = false,
  getFolderLoad,
  onLoadFolder,
  onSelect,
  defaultExpanded = false,
}: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || searchQuery.length > 0)
  const isFolder = node.type === 'folder'
  const isSelected = selectedId === node.id
  const paddingLeft = depth * 12 + 8
  const needsLazyLoad = lazyLoad && isFolder && node.children === undefined
  const folderLoad = isFolder && getFolderLoad ? getFolderLoad(node.id) : undefined
  const isFolderLoading = folderLoad?.status === 'loading'
  const folderLoadError = folderLoad?.status === 'error' ? folderLoad.error : null

  const handleFolderToggle = () => {
    const willExpand = !expanded
    setExpanded(willExpand)
    if (willExpand && needsLazyLoad && onLoadFolder) {
      onLoadFolder(node)
    }
    if (willExpand && folderLoad?.status === 'error' && onLoadFolder) {
      onLoadFolder(node)
    }
  }

  if (isFolder) {
    const FolderIcon = expanded ? FolderOpen : Folder
    const children = node.children ?? []

    return (
      <li role="none">
        <button
          type="button"
          role="treeitem"
          aria-expanded={expanded}
          style={{ paddingLeft }}
          onClick={handleFolderToggle}
          className="group flex h-7 w-full items-center gap-1.5 rounded-[var(--radius-sm)] pr-2 text-left text-[var(--text-secondary)] transition-all duration-200 hover:translate-x-0.5 hover:bg-[rgba(255,200,221,0.06)] hover:text-[var(--text-primary)]"
        >
          <ChevronRight
            size={14}
            className={[
              'shrink-0 text-[var(--text-muted)] transition-transform duration-200',
              expanded && 'rotate-90',
            ].join(' ')}
          />
          {isFolderLoading ? (
            <Loader2 size={15} className="shrink-0 animate-spin text-[var(--bloom-lavender)]" />
          ) : (
            <FolderIcon size={15} className="shrink-0 text-[var(--bloom-lavender)]" />
          )}
          <span className="truncate">{highlightName(node.name, searchQuery)}</span>
        </button>

        {expanded && folderLoadError && (
          <div
            style={{ paddingLeft: paddingLeft + 20 }}
            className="flex items-center gap-1.5 py-1 pr-2 text-[10px] text-red-400"
          >
            <AlertCircle size={12} className="shrink-0" />
            <span className="truncate">{folderLoadError}</span>
          </div>
        )}

        {expanded && !isFolderLoading && !folderLoadError && needsLazyLoad && (
          <div
            style={{ paddingLeft: paddingLeft + 20 }}
            className="py-1 pr-2 text-[10px] text-[var(--text-muted)]"
          >
            Loading…
          </div>
        )}

        {expanded && !needsLazyLoad && children.length > 0 && (
          <ul role="group" className="list-none p-0">
            {children.map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                searchQuery={searchQuery}
                lazyLoad={lazyLoad}
                getFolderLoad={getFolderLoad}
                onLoadFolder={onLoadFolder}
                onSelect={onSelect}
                defaultExpanded={searchQuery.length > 0}
              />
            ))}
          </ul>
        )}

        {expanded && !needsLazyLoad && children.length === 0 && folderLoad?.status === 'loaded' && (
          <p
            style={{ paddingLeft: paddingLeft + 20 }}
            className="m-0 py-1 pr-2 text-[10px] text-[var(--text-muted)]"
          >
            Empty folder
          </p>
        )}
      </li>
    )
  }

  const FileIcon = getFileIcon(node.name)

  return (
    <li role="none">
      <button
        type="button"
        role="treeitem"
        style={{ paddingLeft: paddingLeft + 20 }}
        onClick={() => onSelect(node)}
        className={[
          'flex h-7 w-full items-center gap-1.5 rounded-[var(--radius-sm)] pr-2 text-left transition-all duration-200',
          isSelected
            ? 'border-l-2 border-[var(--bloom-lavender)] bg-[var(--selection-bg)] text-[var(--text-primary)]'
            : 'border-l-2 border-transparent text-[var(--text-secondary)] hover:translate-x-0.5 hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]',
        ].join(' ')}
      >
        <FileIcon size={15} className="shrink-0 text-[var(--bloom-purple)]" />
        <span className="truncate">{highlightName(node.name, searchQuery)}</span>
      </button>
    </li>
  )
}
