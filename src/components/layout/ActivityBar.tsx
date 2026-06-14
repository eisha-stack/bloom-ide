import {
  Files,
  Search,
  GitBranch,
  Puzzle,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ActivityView } from '../../types/ide'
import { IconButton } from '../ui/IconButton'

type ActivityItem = {
  id: ActivityView
  icon?: LucideIcon
  useLogo?: boolean
  label: string
  accent?: boolean
  bottom?: boolean
}

const ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'scm', icon: GitBranch, label: 'Source Control' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions' },
  { id: 'ai', useLogo: true, label: 'AI Assistant', accent: true },
  { id: 'settings', icon: Settings, label: 'Settings', bottom: true },
]

type ActivityBarProps = {
  active: ActivityView
  aiActive?: boolean
  onChange: (view: ActivityView) => void
  scmBadge?: number
}

export function ActivityBar({ active, aiActive = false, onChange, scmBadge = 0 }: ActivityBarProps) {
  const topItems = ACTIVITY_ITEMS.filter((item) => !item.bottom)
  const bottomItems = ACTIVITY_ITEMS.filter((item) => item.bottom)

  return (
    <nav
      aria-label="Activity bar"
      className="flex w-[52px] shrink-0 flex-col items-center border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] py-3"
    >
      <div className="flex flex-col items-center gap-1">
        {topItems.map((item) => (
          <div key={item.id} className="relative">
            <IconButton
              icon={item.icon}
              useLogo={item.useLogo}
              label={item.label}
              active={item.id === 'ai' ? aiActive : active === item.id}
              accent={item.accent}
              onClick={() => onChange(item.id)}
            />
            {item.id === 'scm' && scmBadge > 0 && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-pink-glow)] px-1 text-[10px] font-semibold text-white">
                {scmBadge}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-1">
        {bottomItems.map((item) => (
          <IconButton
            key={item.id}
            icon={item.icon}
            useLogo={item.useLogo}
            label={item.label}
            active={active === item.id}
            onClick={() => onChange(item.id)}
          />
        ))}
      </div>
    </nav>
  )
}
