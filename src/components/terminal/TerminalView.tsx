import { useEffect, useRef } from 'react'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { createXtermTheme } from '../../lib/terminal/xtermTheme'
import { isTauri } from '../../lib/tauri'
import {
  killTerminal,
  listenTerminalExit,
  listenTerminalOutput,
  resizeTerminal,
  spawnTerminal,
  writeTerminal,
} from '../../lib/tauri/terminal'
import { useTerminalStore, type TerminalTab } from '../../stores/terminalStore'
import { useTheme } from '../../theme/ThemeProvider'

type TerminalViewProps = {
  tab: TerminalTab
  active: boolean
}

export function TerminalView({ tab, active }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const sessionIdRef = useRef<string | null>(tab.sessionId)
  const { theme } = useTheme()
  const setSessionId = useTerminalStore((s) => s.setSessionId)

  useEffect(() => {
    sessionIdRef.current = tab.sessionId
  }, [tab.sessionId])

  useEffect(() => {
    if (!containerRef.current || !isTauri()) return undefined

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 13,
      lineHeight: 1.2,
      theme: createXtermTheme(theme),
      scrollback: 5000,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(new WebLinksAddon())
    terminal.open(containerRef.current)
    fitAddonRef.current = fitAddon
    terminalRef.current = terminal

    let disposed = false
    let unlistenOutput: (() => void) | undefined
    let unlistenExit: (() => void) | undefined
    let dataDisposable: { dispose: () => void } | undefined

    const fitTerminal = () => {
      fitAddon.fit()
      const sessionId = sessionIdRef.current
      if (sessionId) {
        void resizeTerminal(sessionId, terminal.cols, terminal.rows)
      }
    }

    void (async () => {
      try {
        fitAddon.fit()
        const spawned = await spawnTerminal({
          shell: tab.shell,
          cols: terminal.cols,
          rows: terminal.rows,
        })

        if (disposed) {
          await killTerminal(spawned.sessionId)
          return
        }

        sessionIdRef.current = spawned.sessionId
        setSessionId(tab.id, spawned.sessionId, spawned.cwd)
        terminal.reset()
        terminal.writeln(`BloomCode terminal — ${spawned.shell}`)
        terminal.writeln(spawned.cwd)
        terminal.write('\r\n')

        unlistenOutput = await listenTerminalOutput((event) => {
          if (event.sessionId === spawned.sessionId) {
            terminal.write(event.data)
          }
        })

        unlistenExit = await listenTerminalExit((event) => {
          if (event.sessionId === spawned.sessionId) {
            terminal.writeln(
              `\r\n[Process exited${event.code != null ? ` with code ${event.code}` : ''}]`,
            )
          }
        })

        dataDisposable = terminal.onData((data) => {
          void writeTerminal(spawned.sessionId, data)
        })
      } catch (error) {
        terminal.reset()
        terminal.writeln(
          `\x1b[31mFailed to start terminal: ${error instanceof Error ? error.message : String(error)}\x1b[0m`,
        )
      }
    })()

    const resizeObserver = new ResizeObserver(() => {
      if (active) fitTerminal()
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      disposed = true
      resizeObserver.disconnect()
      dataDisposable?.dispose()
      unlistenOutput?.()
      unlistenExit?.()
      const sessionId = sessionIdRef.current
      if (sessionId) void killTerminal(sessionId)
      terminal.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [tab.id, tab.shell, setSessionId])

  useEffect(() => {
    const terminal = terminalRef.current
    if (!terminal) return
    terminal.options.theme = createXtermTheme(theme)
  }, [theme])

  useEffect(() => {
    if (!active) return
    requestAnimationFrame(() => {
      fitAddonRef.current?.fit()
      terminalRef.current?.focus()
      const sessionId = sessionIdRef.current
      const terminal = terminalRef.current
      if (sessionId && terminal) {
        void resizeTerminal(sessionId, terminal.cols, terminal.rows)
      }
    })
  }, [active])

  if (!isTauri()) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-[12px] text-[var(--text-muted)]">
        Integrated terminal is available in the BloomCode desktop app.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={[
        'absolute inset-0 overflow-hidden px-2 py-1.5',
        active ? 'visible' : 'invisible',
      ].join(' ')}
    />
  )
}
