import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { isTauri } from '../tauri/env'

export type ShellKind = 'powershell' | 'cmd' | 'bash'

export type ShellInfo = {
  id: ShellKind
  name: string
  available: boolean
}

export type TerminalSpawnResult = {
  sessionId: string
  shell: string
  cwd: string
}

export type TerminalOutputEvent = {
  sessionId: string
  data: string
}

export type TerminalExitEvent = {
  sessionId: string
  code: number | null
}

export type CommandOutputEvent = {
  executionId: string
  data: string
}

export type CommandExitEvent = {
  executionId: string
  code: number | null
  success: boolean
}

function assertTauri() {
  if (!isTauri()) {
    throw new Error('Terminal commands require the BloomCode desktop app.')
  }
}

export async function listShells(): Promise<ShellInfo[]> {
  assertTauri()
  return invoke<ShellInfo[]>('terminal_list_shells')
}

export async function spawnTerminal(options?: {
  shell?: ShellKind
  cwd?: string
  cols?: number
  rows?: number
}): Promise<TerminalSpawnResult> {
  assertTauri()
  return invoke<TerminalSpawnResult>('terminal_spawn', {
    shell: options?.shell ?? null,
    cwd: options?.cwd ?? null,
    cols: options?.cols ?? null,
    rows: options?.rows ?? null,
  })
}

export async function writeTerminal(sessionId: string, data: string): Promise<void> {
  assertTauri()
  return invoke('terminal_write', { sessionId, data })
}

export async function resizeTerminal(
  sessionId: string,
  cols: number,
  rows: number,
): Promise<void> {
  assertTauri()
  return invoke('terminal_resize', { sessionId, cols, rows })
}

export async function killTerminal(sessionId: string): Promise<void> {
  assertTauri()
  return invoke('terminal_kill', { sessionId })
}

export async function executeCommand(
  command: string,
  options?: { shell?: ShellKind; cwd?: string },
): Promise<{ executionId: string }> {
  assertTauri()
  return invoke<{ executionId: string }>('terminal_execute', {
    command,
    shell: options?.shell ?? null,
    cwd: options?.cwd ?? null,
  })
}

export function listenTerminalOutput(
  handler: (event: TerminalOutputEvent) => void,
): Promise<UnlistenFn> {
  assertTauri()
  return listen<TerminalOutputEvent>('terminal-output', (event) => handler(event.payload))
}

export function listenTerminalExit(
  handler: (event: TerminalExitEvent) => void,
): Promise<UnlistenFn> {
  assertTauri()
  return listen<TerminalExitEvent>('terminal-exit', (event) => handler(event.payload))
}

export function listenCommandOutput(
  handler: (event: CommandOutputEvent) => void,
): Promise<UnlistenFn> {
  assertTauri()
  return listen<CommandOutputEvent>('command-output', (event) => handler(event.payload))
}

export function listenCommandExit(handler: (event: CommandExitEvent) => void): Promise<UnlistenFn> {
  assertTauri()
  return listen<CommandExitEvent>('command-exit', (event) => handler(event.payload))
}

export const terminalApi = {
  listShells,
  spawnTerminal,
  writeTerminal,
  resizeTerminal,
  killTerminal,
  executeCommand,
  listenTerminalOutput,
  listenTerminalExit,
  listenCommandOutput,
  listenCommandExit,
  isAvailable: isTauri,
}
