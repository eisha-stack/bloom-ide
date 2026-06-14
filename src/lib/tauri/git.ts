import { invoke } from '@tauri-apps/api/core'
import { isTauri } from './env'

export type GitFileChange = {
  path: string
  staged: boolean
}

export type GitChangeGroup = {
  modified: GitFileChange[]
  added: GitFileChange[]
  deleted: GitFileChange[]
}

export type GitStatusResponse = {
  isRepo: boolean
  branch: string | null
  staged: GitChangeGroup
  unstaged: GitChangeGroup
  totalChanges: number
}

export type GitCommitResponse = {
  commitHash: string
  message: string
}

function assertTauri() {
  if (!isTauri()) {
    throw new Error('Git commands require the BloomCode desktop app.')
  }
}

export async function getGitStatus(): Promise<GitStatusResponse> {
  assertTauri()
  return invoke<GitStatusResponse>('git_get_status')
}

export async function stageAllFiles(): Promise<void> {
  assertTauri()
  return invoke('git_stage_all_files')
}

export async function stageFiles(paths: string[]): Promise<void> {
  assertTauri()
  return invoke('git_stage_files', { paths })
}

export async function createCommit(message: string): Promise<GitCommitResponse> {
  assertTauri()
  return invoke<GitCommitResponse>('git_create_commit', { message })
}

export const gitApi = {
  getGitStatus,
  stageAllFiles,
  stageFiles,
  createCommit,
  isAvailable: isTauri,
}
