import { create } from 'zustand'
import type { GitStatusResponse } from '../lib/tauri/git'
import { createCommit, getGitStatus, stageAllFiles } from '../lib/tauri/git'
import { isTauri } from '../lib/tauri'

export type ScmLoadState = 'idle' | 'loading' | 'loaded' | 'error'

type ScmStore = {
  status: GitStatusResponse | null
  loadState: ScmLoadState
  error: string | null
  commitMessage: string
  isCommitting: boolean
  refresh: () => Promise<void>
  setCommitMessage: (message: string) => void
  stageAllAndCommit: () => Promise<boolean>
}

const emptyStatus: GitStatusResponse = {
  isRepo: false,
  branch: null,
  staged: { modified: [], added: [], deleted: [] },
  unstaged: { modified: [], added: [], deleted: [] },
  totalChanges: 0,
}

export const useScmStore = create<ScmStore>((set, get) => ({
  status: null,
  loadState: 'idle',
  error: null,
  commitMessage: '',
  isCommitting: false,

  setCommitMessage: (message) => set({ commitMessage: message }),

  refresh: async () => {
    if (!isTauri()) {
      set({ status: emptyStatus, loadState: 'loaded', error: null })
      return
    }

    set({ loadState: 'loading', error: null })

    try {
      const status = await getGitStatus()
      set({ status, loadState: 'loaded' })
    } catch (error) {
      set({
        loadState: 'error',
        error: error instanceof Error ? error.message : 'Failed to load git status.',
      })
    }
  },

  stageAllAndCommit: async () => {
    const { commitMessage } = get()
    const trimmed = commitMessage.trim()
    if (!trimmed) {
      set({ error: 'Enter a commit message before committing.' })
      return false
    }

    set({ isCommitting: true, error: null })

    try {
      await stageAllFiles()
      await createCommit(trimmed)
      set({ commitMessage: '' })
      await get().refresh()
      set({ isCommitting: false })
      return true
    } catch (error) {
      set({
        isCommitting: false,
        error: error instanceof Error ? error.message : 'Commit failed.',
      })
      return false
    }
  },
}))

export function useScm() {
  const status = useScmStore((s) => s.status)
  const loadState = useScmStore((s) => s.loadState)
  const error = useScmStore((s) => s.error)
  const commitMessage = useScmStore((s) => s.commitMessage)
  const isCommitting = useScmStore((s) => s.isCommitting)
  const refresh = useScmStore((s) => s.refresh)
  const setCommitMessage = useScmStore((s) => s.setCommitMessage)
  const stageAllAndCommit = useScmStore((s) => s.stageAllAndCommit)

  return {
    status,
    loadState,
    error,
    commitMessage,
    isCommitting,
    refresh,
    setCommitMessage,
    stageAllAndCommit,
    changeCount: status?.totalChanges ?? 0,
  }
}
