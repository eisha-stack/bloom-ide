import { create } from 'zustand'
import { mockFileTree } from '../data/mockFileTree'
import {
  dirEntryToFileNode,
  projectNameFromPath,
  setFolderChildren,
} from '../lib/fs/dirEntryToFileNode'
import { getWorkspace, isTauri, listDir, openFolder } from '../lib/tauri'
import type { FsCommandError } from '../lib/tauri'
import type { FileNode } from '../types/ide'

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

type FolderLoadState = {
  status: LoadStatus
  error: string | null
}

type WorkspaceStore = {
  workspacePath: string | null
  projectName: string
  rootNodes: FileNode[]
  rootLoad: FolderLoadState
  folderLoads: Record<string, FolderLoadState>
  init: () => Promise<void>
  openWorkspace: () => Promise<string | null>
  refreshRoot: () => Promise<void>
  loadFolder: (folderId: string) => Promise<void>
  getFolderLoad: (folderId: string) => FolderLoadState
}

const ROOT_KEY = ''

const idleLoad: FolderLoadState = { status: 'idle', error: null }

function fsErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as FsCommandError).message)
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong while loading the filesystem.'
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspacePath: null,
  projectName: 'bloom-ide',
  rootNodes: [],
  rootLoad: idleLoad,
  folderLoads: {},

  getFolderLoad: (folderId) => {
    if (folderId === ROOT_KEY) return get().rootLoad
    return get().folderLoads[folderId] ?? idleLoad
  },

  init: async () => {
    if (!isTauri()) {
      set({
        projectName: 'bloom-ide',
        rootNodes: mockFileTree,
        rootLoad: { status: 'loaded', error: null },
      })
      return
    }

    set({ rootLoad: { status: 'loading', error: null } })

    try {
      const path = await getWorkspace()
      if (!path) {
        set({
          workspacePath: null,
          rootNodes: [],
          rootLoad: { status: 'idle', error: null },
        })
        return
      }

      set({
        workspacePath: path,
        projectName: projectNameFromPath(path),
      })
      await get().refreshRoot()
    } catch (error) {
      set({
        rootLoad: { status: 'error', error: fsErrorMessage(error) },
      })
    }
  },

  openWorkspace: async () => {
    if (!isTauri()) return null

    set({ rootLoad: { status: 'loading', error: null } })

    try {
      const path = await openFolder()
      if (!path) {
        set((state) => ({
          rootLoad: state.rootNodes.length
            ? { status: 'loaded', error: null }
            : { status: 'idle', error: null },
        }))
        return null
      }

      set({
        workspacePath: path,
        projectName: projectNameFromPath(path),
        folderLoads: {},
        rootNodes: [],
      })

      await get().refreshRoot()
      return path
    } catch (error) {
      set({
        rootLoad: { status: 'error', error: fsErrorMessage(error) },
      })
      return null
    }
  },

  refreshRoot: async () => {
    if (!isTauri()) {
      set({
        rootNodes: mockFileTree,
        rootLoad: { status: 'loaded', error: null },
      })
      return
    }

    set({ rootLoad: { status: 'loading', error: null } })

    try {
      const entries = await listDir()
      set({
        rootNodes: entries.map(dirEntryToFileNode),
        rootLoad: { status: 'loaded', error: null },
        folderLoads: {},
      })
    } catch (error) {
      set({
        rootLoad: { status: 'error', error: fsErrorMessage(error) },
      })
    }
  },

  loadFolder: async (folderId) => {
    const { folderLoads } = get()
    const current = folderLoads[folderId]
    if (current?.status === 'loading' || current?.status === 'loaded') return

    set({
      folderLoads: {
        ...folderLoads,
        [folderId]: { status: 'loading', error: null },
      },
    })

    try {
      const entries = await listDir(folderId)
      const children = entries.map(dirEntryToFileNode)

      set((state) => ({
        rootNodes: setFolderChildren(state.rootNodes, folderId, children),
        folderLoads: {
          ...state.folderLoads,
          [folderId]: { status: 'loaded', error: null },
        },
      }))
    } catch (error) {
      set((state) => ({
        folderLoads: {
          ...state.folderLoads,
          [folderId]: { status: 'error', error: fsErrorMessage(error) },
        },
      }))
    }
  },
}))

export function useWorkspace() {
  const workspacePath = useWorkspaceStore((s) => s.workspacePath)
  const projectName = useWorkspaceStore((s) => s.projectName)
  const rootNodes = useWorkspaceStore((s) => s.rootNodes)
  const rootLoad = useWorkspaceStore((s) => s.rootLoad)
  const init = useWorkspaceStore((s) => s.init)
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace)
  const refreshRoot = useWorkspaceStore((s) => s.refreshRoot)
  const loadFolder = useWorkspaceStore((s) => s.loadFolder)
  const getFolderLoad = useWorkspaceStore((s) => s.getFolderLoad)

  return {
    workspacePath,
    projectName,
    rootNodes,
    rootLoad,
    init,
    openWorkspace,
    refreshRoot,
    loadFolder,
    getFolderLoad,
  }
}
