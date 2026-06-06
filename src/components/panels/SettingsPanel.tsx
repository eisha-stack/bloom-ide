import { motion } from 'framer-motion'
import { Check, Palette } from 'lucide-react'
import { useTheme } from '../../theme/ThemeProvider'
import type { ThemeDefinition, ThemeId } from '../../theme/types'

function ThemeCard({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeDefinition
  active: boolean
  onSelect: () => void
}) {
  const { tokens: t } = theme

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      aria-pressed={active}
      className={[
        'relative w-full overflow-hidden rounded-[var(--radius-lg)] p-3 text-left transition-shadow duration-200',
        active
          ? 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-sidebar)] shadow-[var(--shadow-glow)]'
          : 'ring-1 ring-[var(--border-subtle)] hover:shadow-[var(--shadow-soft)]',
      ].join(' ')}
      style={{ background: t.bgCard }}
    >
      {/* Mini preview */}
      <div
        className="mb-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)]"
        style={{ background: t.bgPrimary }}
      >
        <div className="flex h-16">
          <div className="w-3 shrink-0" style={{ background: t.sidebar }} />
          <div className="flex flex-1 flex-col">
            <div className="h-3 border-b border-[var(--border-subtle)]" style={{ background: t.bgSecondary }} />
            <div className="flex flex-1">
              <div className="flex-1 p-2" style={{ background: t.bgEditor }}>
                <div className="mb-1 h-1 w-8 rounded-full" style={{ background: t.accentPrimary, opacity: 0.8 }} />
                <div className="h-1 w-12 rounded-full" style={{ background: t.textMuted, opacity: 0.4 }} />
                <div className="mt-1 h-1 w-10 rounded-full" style={{ background: t.textMuted, opacity: 0.3 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="m-0 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
            <span aria-hidden>{theme.emoji}</span>
            {theme.name}
          </p>
          <p className="m-0 mt-0.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
            {theme.description}
          </p>
        </div>
        {active && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)] text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Swatches */}
      <div className="mt-2.5 flex gap-1">
        {[t.accentPrimary, t.accentSecondary, t.sidebar, t.bgEditor, t.textPrimary].map(
          (color, i) => (
            <span
              key={i}
              aria-hidden
              className="h-3 w-3 rounded-full ring-1 ring-[var(--border-subtle)]"
              style={{ background: color }}
            />
          ),
        )}
      </div>
    </motion.button>
  )
}

export function SettingsPanel() {
  const { themeId, setThemeId, themes } = useTheme()

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="shrink-0 px-4 py-3">
        <div className="flex items-center gap-2">
          <Palette size={14} className="text-[var(--bloom-lavender)]" />
          <h2 className="m-0 font-[family-name:var(--font-heading)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Settings
          </h2>
        </div>
      </header>

      <div className="px-4 pb-4">
        <section>
          <h3 className="m-0 mb-1 text-[13px] font-semibold text-[var(--text-primary)]">
            Appearance
          </h3>
          <p className="m-0 mb-4 text-[11px] text-[var(--text-muted)]">
            Choose a girl-coded theme. Changes apply instantly across the IDE.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                active={themeId === theme.id}
                onSelect={() => setThemeId(theme.id as ThemeId)}
              />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Active theme
          </p>
          <p className="m-0 mt-1 text-[12px] text-[var(--text-secondary)]">
            {themes.find((t) => t.id === themeId)?.emoji}{' '}
            {themes.find((t) => t.id === themeId)?.name}
            {' · '}
            <span className="capitalize">{themes.find((t) => t.id === themeId)?.mode} mode</span>
          </p>
        </section>
      </div>
    </div>
  )
}
