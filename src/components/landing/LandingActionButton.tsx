import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { BloomLogo } from '../ui/BloomLogo'

type LandingActionButtonProps = {
  label: string
  description?: string
  icon: LucideIcon
  variant?: 'primary' | 'ghost'
  useLogo?: boolean
  onClick?: () => void
  delay?: number
}

export function LandingActionButton({
  label,
  description,
  icon: Icon,
  variant = 'ghost',
  useLogo = false,
  onClick,
  delay = 0,
}: LandingActionButtonProps) {
  const isPrimary = variant === 'primary'

  if (isPrimary) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-6 py-2.5 text-[13px] font-semibold text-white"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[var(--accent-pink-glow)] to-[var(--accent-purple-glow)] opacity-90 transition-opacity group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 blur-xl transition-opacity group-hover:opacity-60"
          style={{
            background: 'linear-gradient(90deg, #ff69b4, #a855f7)',
          }}
        />
        {useLogo ? (
          <BloomLogo size="xs" className="relative z-10 brightness-110" alt="" />
        ) : (
          <Icon size={16} className="relative z-10" strokeWidth={2} />
        )}
        <span className="relative z-10">{label}</span>
        <ArrowUpRight
          size={14}
          className="relative z-10 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
        />
      </motion.button>
    )
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className="group flex items-start gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[rgba(255,182,193,0.04)]"
    >
      <Icon
        size={18}
        className="mt-0.5 shrink-0 text-[var(--bloom-lavender)] transition-colors group-hover:text-[var(--bloom-pink)]"
        strokeWidth={1.75}
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--bloom-lilac)]">
          {label}
          <ArrowUpRight
            size={12}
            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-50"
          />
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-relaxed text-[var(--text-muted)]">
            {description}
          </span>
        )}
      </span>
    </motion.button>
  )
}
