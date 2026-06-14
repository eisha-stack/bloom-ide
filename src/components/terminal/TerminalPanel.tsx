import { useTerminal } from '../../stores/terminalStore'
import { PanelResizeHandle } from './PanelResizeHandle'
import { TerminalTabBar } from './TerminalTabBar'
import { TerminalView } from './TerminalView'

export function TerminalPanel() {
  const { tabs, activeTabId, panelOpen, panelHeight, setPanelHeight } = useTerminal()

  if (!panelOpen || tabs.length === 0) return null

  return (
    <>
      <PanelResizeHandle panelHeight={panelHeight} onResize={setPanelHeight} />
      <section
        className="flex min-h-0 shrink-0 flex-col overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--bg-editor)]"
        style={{ height: panelHeight }}
        aria-label="Integrated terminal"
      >
        <TerminalTabBar />
        <div className="relative min-h-0 flex-1">
          {tabs.map((tab) => (
            <TerminalView key={tab.id} tab={tab} active={tab.id === activeTabId} />
          ))}
        </div>
      </section>
    </>
  )
}
