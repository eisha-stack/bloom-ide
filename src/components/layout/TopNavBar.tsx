import { motion } from 'framer-motion'
import { GitBranch, Search } from 'lucide-react'
import { BloomLogo } from '../ui/BloomLogo'

type TopNavBarProps = {
  projectName?: string
  branch?: string
  onSearch?: (query: string) => void
}

export function TopNavBar({
  projectName = 'bloom-ide',
  branch = 'main',
  onSearch,
}: TopNavBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="gradient-border-bottom relative z-10 shrink-0 px-4 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      style={{
        background: 'rgba(27, 24, 38, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 items-center gap-2.5">
          <BloomLogo size="sm" glow />
          <span className="hidden font-[family-name:var(--font-heading)] text-[15px] font-semibold tracking-tight text-[var(--text-primary)] sm:inline">
            BloomCode
          </span>
        </div>

        <div className="h-5 w-px bg-[var(--border-subtle)]" aria-hidden />

        <span className="shrink-0 font-[family-name:var(--font-heading)] text-[13px] font-medium text-[var(--bloom-lilac)]">
          {projectName}
        </span>

        <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[rgba(42,36,56,0.5)] px-3 py-1.5 transition-[box-shadow,border-color] duration-200 focus-within:border-[rgba(168,85,247,0.35)] focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.12)]">
          <Search size={14} className="shrink-0 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search workspace..."
            aria-label="Search workspace"
            onChange={(e) => onSearch?.(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[rgba(42,36,56,0.4)] px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-all duration-200 hover:border-[rgba(255,182,193,0.25)] hover:bg-[rgba(255,182,193,0.06)] hover:text-[var(--text-primary)] md:flex"
        >
          <GitBranch size={13} className="text-[var(--bloom-lavender)]" />
          {branch}
        </button>

        <button
          type="button"
          aria-label="User profile"
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--bloom-pink)] to-[var(--accent-purple-glow)] text-[11px] font-semibold text-white shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-transform duration-200 hover:scale-105"
        >
          EB
        </button>
      </div>
    </motion.header>
  )
}
