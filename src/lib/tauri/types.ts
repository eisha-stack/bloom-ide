/** Structured error returned from Tauri filesystem commands */
export type FsCommandError = {
  code: string
  message: string
}

export type DirEntry = {
  name: string
  path: string
  isDir: boolean
}

export const FS_ERROR_CODES = {
  NO_WORKSPACE: 'NO_WORKSPACE',
  INVALID_PATH: 'INVALID_PATH',
  PATH_TRAVERSAL: 'PATH_TRAVERSAL',
  OUTSIDE_WORKSPACE: 'OUTSIDE_WORKSPACE',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  NOT_FOUND: 'NOT_FOUND',
  IS_DIRECTORY: 'IS_DIRECTORY',
  DIALOG_ERROR: 'DIALOG_ERROR',
  IO_ERROR: 'IO_ERROR',
} as const

export type FsErrorCode = (typeof FS_ERROR_CODES)[keyof typeof FS_ERROR_CODES]
