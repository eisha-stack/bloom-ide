import { invoke } from '@tauri-apps/api/core'
import { isTauri } from './env'
import type { DirEntry, FsCommandError } from './types'

function assertTauri() {
  if (!isTauri()) {
    throw {
      code: 'NOT_TAURI',
      message: 'Filesystem commands are only available in the Tauri desktop app.',
    } satisfies FsCommandError
  }
}

async function invokeFs<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  assertTauri()
  try {
    return await invoke<T>(command, args)
  } catch (error) {
    if (isFsCommandError(error)) throw error
    throw {
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : String(error),
    } satisfies FsCommandError
  }
}

function isFsCommandError(error: unknown): error is FsCommandError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as FsCommandError).code === 'string'
  )
}

/** Open a folder via native dialog and set it as the workspace root */
export async function openFolder(): Promise<string | null> {
  return invokeFs<string | null>('open_folder')
}

/** Get the current workspace root path, if set */
export async function getWorkspace(): Promise<string | null> {
  return invokeFs<string | null>('get_workspace')
}

/** Read a UTF-8 file relative to the workspace root */
export async function readFile(path: string): Promise<string> {
  return invokeFs<string>('read_file', { path })
}

/** Write UTF-8 content to a file relative to the workspace root */
export async function writeFile(path: string, content: string): Promise<void> {
  return invokeFs<void>('write_file', { path, content })
}

/** Create a new file relative to the workspace root */
export async function createFile(path: string, content = ''): Promise<void> {
  return invokeFs<void>('create_file', { path, content })
}

/** Delete a file relative to the workspace root */
export async function deleteFile(path: string): Promise<void> {
  return invokeFs<void>('delete_file', { path })
}

/** Rename or move a file within the workspace */
export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  return invokeFs<void>('rename_file', { oldPath, newPath })
}

/** List directory entries relative to the workspace root */
export async function listDir(path?: string): Promise<DirEntry[]> {
  return invokeFs<DirEntry[]>('list_dir', { path: path ?? null })
}

export const tauriFs = {
  openFolder,
  getWorkspace,
  readFile,
  writeFile,
  createFile,
  deleteFile,
  renameFile,
  listDir,
  isAvailable: isTauri,
}

export type { FsCommandError, DirEntry }
