import { motion } from 'framer-motion'
import { Bug, Code2, Lightbulb, Zap } from 'lucide-react'

const SUGGESTED_PROMPTS = [
  { label: 'Explain this function', icon: Lightbulb },
  { label: 'Fix bugs', icon: Bug },
  { label: 'Generate React component', icon: Code2 },
  { label: 'Optimize code', icon: Zap },
] as const

type SuggestedPromptsProps = {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="shrink-0 p-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Suggested
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SUGGESTED_PROMPTS.map(({ label, icon: Icon }) => (
          <motion.button
            key={label}
            type="button"
            disabled={disabled}
            whileHover={disabled ? undefined : { y: -2, scale: 1.02 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            onClick={() => onSelect(label)}
            className="glass-panel flex items-center gap-2 px-2.5 py-2 text-left text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[rgba(255,182,193,0.2)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon size={13} className="shrink-0 text-[var(--bloom-lavender)]" />
            <span className="leading-tight">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
