import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { GradientBlobs } from './GradientBlobs'
import { LandingActionButton } from './LandingActionButton'
import { LANDING_ACTIONS, PRODUCT_ALIASES, type LandingActionId } from './landingActions'

type LandingEmptyStateProps = {
  onAction: (action: LandingActionId) => void
}

export function LandingEmptyState({ onAction }: LandingEmptyStateProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-[var(--bg-editor)] p-4 sm:p-8">
      <GradientBlobs />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[520px]"
      >
        {/* Hero card */}
        <div className="glass-panel overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
          {/* Gradient top accent */}
          <div
            aria-hidden
            className="h-1 w-full bg-gradient-to-r from-[var(--bloom-pink)] via-[var(--bloom-lavender)] to-[var(--accent-purple-glow)]"
          />

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--bloom-blush)] via-[var(--bloom-lavender)] to-[var(--accent-purple-glow)] shadow-[0_0_40px_rgba(255,105,180,0.25)]">
                  <Sparkles size={26} className="text-white" strokeWidth={1.75} />
                </div>
                <motion.span
                  aria-hidden
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--bloom-lilac)] shadow-[0_0_8px_rgba(229,217,242,0.6)]"
                />
              </div>
            </motion.div>

            {/* Welcome copy */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mb-8 text-center"
            >
              <h1 className="m-0 mb-2 font-[family-name:var(--font-heading)] text-[clamp(1.5rem,4vw,1.875rem)] font-bold tracking-tight text-[var(--text-primary)]">
                <span aria-hidden className="mr-1.5">
                  💖
                </span>
                Welcome to BloomCode
              </h1>
              <p className="m-0 text-[clamp(0.875rem,2.5vw,1rem)] font-medium tracking-wide text-[var(--bloom-lilac)]">
                Code beautifully. Build confidently.
              </p>
            </motion.div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {LANDING_ACTIONS.map((action, index) => (
                <div
                  key={action.id}
                  className={action.id === 'continue-ai' ? 'sm:col-span-2' : undefined}
                >
                  <LandingActionButton
                    label={action.label}
                    description={action.description}
                    icon={action.icon}
                    variant={action.variant}
                    delay={0.2 + index * 0.06}
                    onClick={() => onAction(action.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer aliases */}
          <div className="border-t border-[var(--border-subtle)] bg-[rgba(21,19,29,0.3)] px-6 py-3 sm:px-8">
            <p className="m-0 text-center text-[10px] tracking-wider text-[var(--text-muted)]">
              {PRODUCT_ALIASES.join(' · ')}
            </p>
          </div>
        </div>

        {/* Keyboard hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center text-[11px] text-[var(--text-muted)]"
        >
          Or pick a file from the{' '}
          <span className="text-[var(--bloom-lavender)]">Explorer</span> to begin
        </motion.p>
      </motion.div>
    </div>
  )
}
