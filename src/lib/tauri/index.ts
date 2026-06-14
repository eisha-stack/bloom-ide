export { isTauri } from './env'
export {
  tauriFs,
  openFolder,
  getWorkspace,
  readFile,
  writeFile,
  createFile,
  deleteFile,
  renameFile,
  listDir,
} from './fs'
export { terminalApi } from './terminal'
export type {
  ShellKind,
  ShellInfo,
  TerminalSpawnResult,
  TerminalOutputEvent,
  TerminalExitEvent,
  CommandOutputEvent,
  CommandExitEvent,
} from './terminal'
export type { FsCommandError, DirEntry, FsErrorCode } from './types'
export { FS_ERROR_CODES } from './types'
