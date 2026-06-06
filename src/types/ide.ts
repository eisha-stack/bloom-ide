export type ActivityView =
  | 'explorer'
  | 'search'
  | 'scm'
  | 'extensions'
  | 'ai'
  | 'settings'

export type FileNode = {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  language?: string
}

export type { EditorDocument as OpenTab } from '../editor/types'
