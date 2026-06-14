import type { LoadStatus } from '../../stores/workspaceStore'
import type { FileNode } from '../../types/ide'
import { FileTreeItem } from './FileTreeItem'

type FolderLoadState = {
  status: LoadStatus
  error: string | null
}

type FileTreeProps = {
  nodes: FileNode[]
  selectedId: string | null
  searchQuery: string
  lazyLoad?: boolean
  getFolderLoad?: (folderId: string) => FolderLoadState
  onLoadFolder?: (node: FileNode) => void
  onSelect: (node: FileNode) => void
}

export function FileTree({
  nodes,
  selectedId,
  searchQuery,
  lazyLoad = false,
  getFolderLoad,
  onLoadFolder,
  onSelect,
}: FileTreeProps) {
  if (nodes.length === 0) return null

  return (
    <ul role="tree" aria-label="Project files" className="m-0 list-none p-0">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          searchQuery={searchQuery}
          lazyLoad={lazyLoad}
          getFolderLoad={getFolderLoad}
          onLoadFolder={onLoadFolder}
          onSelect={onSelect}
          defaultExpanded={!lazyLoad}
        />
      ))}
    </ul>
  )
}
