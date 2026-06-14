import type { DirEntry } from '../tauri/types'
import type { FileNode } from '../../types/ide'

export function dirEntryToFileNode(entry: DirEntry): FileNode {
  if (entry.isDir) {
    return {
      id: entry.path,
      name: entry.name,
      type: 'folder',
    }
  }

  return {
    id: entry.path,
    name: entry.name,
    type: 'file',
  }
}

export function projectNameFromPath(path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? path
}

export function setFolderChildren(
  nodes: FileNode[],
  folderId: string,
  children: FileNode[],
): FileNode[] {
  return nodes.map((node) => {
    if (node.id === folderId && node.type === 'folder') {
      return { ...node, children }
    }
    if (node.type === 'folder' && node.children) {
      return { ...node, children: setFolderChildren(node.children, folderId, children) }
    }
    return node
  })
}
