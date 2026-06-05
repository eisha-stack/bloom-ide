import { useState } from 'react'
import {
  ChevronRight,
  FileCode2,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
} from 'lucide-react'
import type { FileNode } from '../../types/ide'

type FileTreeItemProps = {
  node: FileNode
  depth: number
  selectedId: string | null
  searchQuery: string
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
  onSelect,
  defaultExpanded = false,
}: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || searchQuery.length > 0)
  const isFolder = node.type === 'folder'
  const isSelected = selectedId === node.id
  const paddingLeft = depth * 12 + 8

  if (isFolder) {
    const FolderIcon = expanded ? FolderOpen : Folder
    return (
      <li role="none">
        <button
          type="button"
          role="treeitem"
          aria-expanded={expanded}
          style={{ paddingLeft }}
          onClick={() => setExpanded((v) => !v)}
          className="group flex h-7 w-full items-center gap-1.5 rounded-[var(--radius-sm)] pr-2 text-left text-[var(--text-secondary)] transition-all duration-200 hover:translate-x-0.5 hover:bg-[rgba(255,200,221,0.06)] hover:text-[var(--text-primary)]"
        >
          <ChevronRight
            size={14}
            className={[
              'shrink-0 text-[var(--text-muted)] transition-transform duration-200',
              expanded && 'rotate-90',
            ].join(' ')}
          />
          <FolderIcon size={15} className="shrink-0 text-[var(--bloom-lavender)]" />
          <span className="truncate">{highlightName(node.name, searchQuery)}</span>
        </button>
        {expanded && node.children && node.children.length > 0 && (
          <ul role="group" className="list-none p-0">
            {node.children.map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                searchQuery={searchQuery}
                onSelect={onSelect}
                defaultExpanded={searchQuery.length > 0}
              />
            ))}
          </ul>
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
            ? 'border-l-2 border-[var(--bloom-lavender)] bg-[rgba(184,162,227,0.12)] text-[var(--text-primary)]'
            : 'border-l-2 border-transparent text-[var(--text-secondary)] hover:translate-x-0.5 hover:bg-[rgba(255,200,221,0.06)] hover:text-[var(--text-primary)]',
        ].join(' ')}
      >
        <FileIcon size={15} className="shrink-0 text-[var(--bloom-purple)]" />
        <span className="truncate">{highlightName(node.name, searchQuery)}</span>
      </button>
    </li>
  )
}
