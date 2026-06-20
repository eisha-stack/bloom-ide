import { motion } from 'framer-motion'
import { Bug, FlaskConical, Lightbulb, RefreshCw, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CODE_ACTIONS, type CodeActionId } from '../../lib/ai/codeActions'

const ACTION_ICONS: Record<CodeActionId, LucideIcon> = {
  explain: Lightbulb,
  refactor: RefreshCw,
  'fix-bug': Bug,
  optimize: Zap,
  'generate-tests': FlaskConical,
}

type CodeActionsProps = {
  hasSelection: boolean
  disabled?: boolean
  onAction: (actionId: CodeActionId) => void
}

export function CodeActions({ hasSelection, disabled, onAction }: CodeActionsProps) {
  return (
    <div className="mb-2">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Actions
      </p>
      {!hasSelection && (
        <p className="mb-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
          Select code in the editor to enable actions.
        </p>
      )}
      <div className="grid grid-cols-2 gap-1.5">
        {CODE_ACTIONS.map(({ id, label, description }) => {
          const Icon = ACTION_ICONS[id]
          const isDisabled = disabled || !hasSelection

          return (
            <motion.button
              key={id}
              type="button"
              disabled={isDisabled}
              title={hasSelection ? description : 'Select code in the editor first'}
              whileHover={isDisabled ? undefined : { y: -1, scale: 1.01 }}
              whileTap={isDisabled ? undefined : { scale: 0.98 }}
              onClick={() => onAction(id)}
              className="glass-panel flex items-center gap-2 px-2.5 py-2 text-left text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[rgba(255,182,193,0.2)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Icon size={13} className="shrink-0 text-[var(--bloom-lavender)]" />
              <span className="leading-tight">{label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
