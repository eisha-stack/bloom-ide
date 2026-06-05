import { useMemo } from 'react'
import type { FileNode } from '../types/ide'

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes

  const result: FileNode[] = []

  for (const node of nodes) {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(q)) {
        result.push(node)
      }
      continue
    }

    const filteredChildren = filterTree(node.children ?? [], q)
    if (filteredChildren.length > 0 || node.name.toLowerCase().includes(q)) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      })
    }
  }

  return result
}

export function useFileTreeFilter(tree: FileNode[], query: string) {
  return useMemo(() => filterTree(tree, query), [tree, query])
}
