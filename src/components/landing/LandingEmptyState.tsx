import { motion } from 'framer-motion'
import { BloomLogo } from '../ui/BloomLogo'
import { GradientBlobs } from './GradientBlobs'
import { LandingActionButton } from './LandingActionButton'
import { LANDING_ACTIONS, PRODUCT_ALIASES, type LandingActionId } from './landingActions'

type LandingEmptyStateProps = {
  onAction: (action: LandingActionId) => void
}

const SECONDARY_ACTIONS = LANDING_ACTIONS.filter((a) => a.variant === 'secondary')
const PRIMARY_ACTION = LANDING_ACTIONS.find((a) => a.variant === 'primary')!

export function LandingEmptyState({ onAction }: LandingEmptyStateProps) {
  return (
    <div className="landing-canvas relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-editor)]">
      <GradientBlobs />

      <div aria-hidden className="landing-grid pointer-events-none absolute inset-0 opacity-[0.35]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[640px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mb-8 flex items-center gap-3"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BloomLogo size="lg" glow />
            </motion.div>
            <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
              BloomCode
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
            className="mb-10"
          >
            <h1 className="m-0 mb-3 font-[family-name:var(--font-heading)] text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-[var(--bloom-blush)] via-[var(--bloom-lavender)] to-[var(--accent-purple-glow)] bg-clip-text text-transparent">
                BloomCode
              </span>
            </h1>
            <p className="m-0 max-w-[420px] text-[clamp(0.9375rem,2vw,1.0625rem)] leading-relaxed text-[var(--text-secondary)]">
              Code beautifully.{' '}
              <span className="text-[var(--bloom-lilac)]">Build confidently.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Get started
            </p>
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-3 sm:gap-x-6">
              {SECONDARY_ACTIONS.map((action, index) => (
                <LandingActionButton
                  key={action.id}
                  label={action.label}
                  description={action.description}
                  icon={action.icon}
                  variant="ghost"
                  delay={0.25 + index * 0.07}
                  onClick={() => onAction(action.id)}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4"
          >
            <LandingActionButton
              label={PRIMARY_ACTION.label}
              icon={PRIMARY_ACTION.icon}
              variant="primary"
              useLogo
              delay={0.5}
              onClick={() => onAction(PRIMARY_ACTION.id)}
            />
            <span className="text-[12px] text-[var(--text-muted)]">
              {PRIMARY_ACTION.description}
            </span>
          </motion.div>
        </div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="relative z-10 flex shrink-0 flex-col items-center gap-2 border-t border-[rgba(205,180,219,0.06)] px-6 py-4 sm:flex-row sm:justify-between"
      >
        <p className="m-0 text-[11px] text-[var(--text-muted)]">
          Or pick a file from the{' '}
          <span className="text-[var(--bloom-lavender)]">Explorer</span>
        </p>
        <p className="m-0 hidden text-[10px] tracking-wide text-[var(--text-muted)] opacity-60 sm:block">
          {PRODUCT_ALIASES.join(' · ')}
        </p>
      </motion.footer>
    </div>
  )
}
