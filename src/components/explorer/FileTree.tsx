import type { FileNode } from '../../types/ide'
import { FileTreeItem } from './FileTreeItem'

type FileTreeProps = {
  nodes: FileNode[]
  selectedId: string | null
  searchQuery: string
  onSelect: (node: FileNode) => void
}

export function FileTree({ nodes, selectedId, searchQuery, onSelect }: FileTreeProps) {
  if (nodes.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-[12px] text-[var(--text-muted)]">
        No files match your search
      </p>
    )
  }

  return (
    <ul role="tree" aria-label="Project files" className="m-0 list-none p-0">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          searchQuery={searchQuery}
          onSelect={onSelect}
          defaultExpanded
        />
      ))}
    </ul>
  )
}
