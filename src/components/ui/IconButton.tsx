import type { LucideIcon } from 'lucide-react'
import { BloomLogo } from './BloomLogo'

type IconButtonProps = {
  icon?: LucideIcon
  useLogo?: boolean
  label: string
  active?: boolean
  accent?: boolean
  onClick: () => void
}

export function IconButton({
  icon: Icon,
  useLogo = false,
  label,
  active = false,
  accent = false,
  onClick,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={[
        'group relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-icon)]',
        'transition-all duration-200',
        active
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-muted)] hover:bg-[rgba(255,182,193,0.08)] hover:text-[var(--bloom-blush)]',
      ].join(' ')}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 h-5 w-[3px] rounded-r-full bg-[var(--accent-pink-glow)] shadow-[0_0_12px_rgba(255,105,180,0.35)]"
        />
      )}
      {useLogo ? (
        <BloomLogo
          size="sm"
          glow={active}
          className={[
            'transition-transform duration-200 group-hover:scale-105',
            active && 'drop-shadow-[0_0_8px_rgba(255,105,180,0.4)]',
          ].join(' ')}
        />
      ) : (
        Icon && (
          <Icon
            size={22}
            strokeWidth={1.75}
            className={[
              'transition-transform duration-200 group-hover:scale-105',
              active && 'drop-shadow-[0_0_8px_rgba(255,105,180,0.4)]',
              accent && !active && 'text-[var(--bloom-lavender)]',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        )
      )}
    </button>
  )
}
