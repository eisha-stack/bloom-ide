import { motion } from 'framer-motion'
import { Bot, Check, Palette, Save } from 'lucide-react'
import { OPENROUTER_MODELS } from '../../lib/ai/openrouter'
import type { AIProviderId } from '../../lib/ai'
import { useSettings } from '../../stores/settingsStore'
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
  const {
    autoSave,
    setAutoSave,
    aiProviderId,
    setAiProviderId,
    openRouterApiKey,
    setOpenRouterApiKey,
    openRouterModel,
    setOpenRouterModel,
    hasOpenRouterKey,
  } = useSettings()

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

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Save size={14} className="text-[var(--bloom-lavender)]" />
            <h3 className="m-0 text-[13px] font-semibold text-[var(--text-primary)]">Editor</h3>
          </div>

          <label className="flex cursor-pointer items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3 transition-colors hover:bg-[var(--hover-bg)]">
            <div>
              <p className="m-0 text-[12px] font-medium text-[var(--text-primary)]">Auto-save</p>
              <p className="m-0 mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                Automatically save workspace files 1.5s after you stop typing. Manual save with{' '}
                <kbd className="rounded border border-[var(--border-subtle)] px-1 py-0.5 font-mono text-[10px]">
                  Ctrl+S
                </kbd>{' '}
                always works.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent-primary)]"
            />
          </label>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Bot size={14} className="text-[var(--bloom-lavender)]" />
            <h3 className="m-0 text-[13px] font-semibold text-[var(--text-primary)]">AI Assistant</h3>
          </div>
          <p className="m-0 mb-4 text-[11px] text-[var(--text-muted)]">
            Connect OpenRouter to use real models in the chat panel. Your key is stored locally in
            this browser only.
          </p>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-[var(--text-secondary)]">
                Provider
              </span>
              <select
                value={aiProviderId}
                onChange={(e) => setAiProviderId(e.target.value as AIProviderId)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[rgba(168,85,247,0.35)]"
              >
                <option value="mock">Mock (offline demo)</option>
                <option value="openrouter">OpenRouter</option>
              </select>
            </label>

            {aiProviderId === 'openrouter' && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium text-[var(--text-secondary)]">
                    OpenRouter API key
                  </span>
                  <input
                    type="password"
                    value={openRouterApiKey}
                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                    placeholder="sk-or-v1-…"
                    autoComplete="off"
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[rgba(168,85,247,0.35)]"
                  />
                  <p className="m-0 mt-1.5 text-[10px] text-[var(--text-muted)]">
                    Get a key at{' '}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[var(--bloom-lilac)] underline"
                    >
                      openrouter.ai/keys
                    </a>
                    . Never commit keys to git.
                  </p>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium text-[var(--text-secondary)]">
                    Model
                  </span>
                  <select
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[rgba(168,85,247,0.35)]"
                  >
                    {OPENROUTER_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div
                  className={[
                    'rounded-[var(--radius-md)] border px-3 py-2 text-[11px]',
                    hasOpenRouterKey
                      ? 'border-[rgba(134,239,172,0.25)] bg-[rgba(134,239,172,0.08)] text-[var(--success)]'
                      : 'border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.08)] text-[var(--error)]',
                  ].join(' ')}
                >
                  {hasOpenRouterKey
                    ? 'OpenRouter is configured. Open the AI panel and start chatting.'
                    : 'Paste your OpenRouter API key above to enable real AI responses.'}
                </div>
              </>
            )}
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
