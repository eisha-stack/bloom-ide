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

function waitForLayout(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (element.clientWidth > 0 && element.clientHeight > 0) {
        resolve()
        return
      }
      requestAnimationFrame(check)
    }
    check()
  })
}

export function TerminalView({ tab, active }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const sessionIdRef = useRef<string | null>(tab.sessionId)
  const spawnGenerationRef = useRef(0)
  const { theme } = useTheme()
  const setSessionId = useTerminalStore((s) => s.setSessionId)

  useEffect(() => {
    sessionIdRef.current = tab.sessionId
  }, [tab.sessionId])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !isTauri()) return undefined

    const generation = ++spawnGenerationRef.current
    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 13,
      lineHeight: 1.2,
      theme: createXtermTheme(theme),
      scrollback: 5000,
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.loadAddon(new WebLinksAddon())
    terminal.open(container)
    fitAddonRef.current = fitAddon
    terminalRef.current = terminal

    let unlistenOutput: (() => void) | undefined
    let unlistenExit: (() => void) | undefined

    const fitTerminal = () => {
      if (!container.clientWidth || !container.clientHeight) return
      fitAddon.fit()
      const sessionId = sessionIdRef.current
      if (sessionId && terminal.cols > 0 && terminal.rows > 0) {
        void resizeTerminal(sessionId, terminal.cols, terminal.rows)
      }
    }

    // Register input handler immediately so keystrokes are never missed.
    const dataDisposable = terminal.onData((data) => {
      const sessionId = sessionIdRef.current
      if (!sessionId) return
      void writeTerminal(sessionId, data).catch((error) => {
        terminal.writeln(
          `\r\n\x1b[31m[write error: ${error instanceof Error ? error.message : String(error)}]\x1b[0m`,
        )
      })
    })

    const focusTerminal = () => {
      terminal.focus()
    }
    container.addEventListener('mousedown', focusTerminal)

    void (async () => {
      try {
        await waitForLayout(container)
        if (generation !== spawnGenerationRef.current) return

        fitAddon.fit()
        const cols = Math.max(terminal.cols, 80)
        const rows = Math.max(terminal.rows, 24)

        const spawned = await spawnTerminal({
          shell: tab.shell,
          cols,
          rows,
        })

        if (generation !== spawnGenerationRef.current) {
          await killTerminal(spawned.sessionId)
          return
        }

        sessionIdRef.current = spawned.sessionId
        setSessionId(tab.id, spawned.sessionId, spawned.cwd)

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

        fitTerminal()
        terminal.focus()
      } catch (error) {
        if (generation !== spawnGenerationRef.current) return
        terminal.writeln(
          `\x1b[31mFailed to start terminal: ${error instanceof Error ? error.message : String(error)}\x1b[0m`,
        )
      }
    })()

    const resizeObserver = new ResizeObserver(() => {
      if (active) fitTerminal()
    })
    resizeObserver.observe(container)

    return () => {
      if (generation === spawnGenerationRef.current) {
        spawnGenerationRef.current += 1
      }
      container.removeEventListener('mousedown', focusTerminal)
      dataDisposable.dispose()
      unlistenOutput?.()
      unlistenExit?.()
      const sessionId = sessionIdRef.current
      sessionIdRef.current = null
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
      if (sessionId && terminal && terminal.cols > 0 && terminal.rows > 0) {
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
        'terminal-xterm-host absolute inset-0 overflow-hidden px-2 py-1.5',
        active ? 'z-10' : 'z-0 pointer-events-none invisible',
      ].join(' ')}
    />
  )
}
