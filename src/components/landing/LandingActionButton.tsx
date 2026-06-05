import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type LandingActionButtonProps = {
  label: string
  description?: string
  icon: LucideIcon
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  delay?: number
}

export function LandingActionButton({
  label,
  description,
  icon: Icon,
  variant = 'secondary',
  onClick,
  delay = 0,
}: LandingActionButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        'group flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3.5 text-left transition-shadow duration-200',
        isPrimary
          ? 'bg-gradient-to-r from-[var(--accent-pink-glow)] to-[var(--accent-purple-glow)] text-white shadow-[0_8px_32px_rgba(168,85,247,0.3)] hover:shadow-[0_12px_40px_rgba(255,105,180,0.35)]'
          : 'glass-panel hover:border-[rgba(255,182,193,0.22)] hover:bg-[rgba(42,36,56,0.85)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-200 group-hover:scale-105',
          isPrimary
            ? 'bg-white/20'
            : 'bg-[rgba(184,162,227,0.12)] group-hover:bg-[rgba(255,182,193,0.1)]',
        ].join(' ')}
      >
        <Icon
          size={18}
          className={isPrimary ? 'text-white' : 'text-[var(--bloom-lavender)]'}
          strokeWidth={1.75}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            'block text-[13px] font-semibold tracking-tight',
            isPrimary ? 'text-white' : 'text-[var(--text-primary)]',
          ].join(' ')}
        >
          {label}
        </span>
        {description && (
          <span
            className={[
              'mt-0.5 block truncate text-[11px]',
              isPrimary ? 'text-white/75' : 'text-[var(--text-muted)]',
            ].join(' ')}
          >
            {description}
          </span>
        )}
      </span>
    </motion.button>
  )
}
