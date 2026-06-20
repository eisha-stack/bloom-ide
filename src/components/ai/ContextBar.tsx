import { FileCode2, Files, FolderTree, TextSelect } from 'lucide-react'
import type { LLMContextSummary } from '../../lib/ai/context'

type ContextBarProps = {
  summary: LLMContextSummary
}

function Chip({
  icon: Icon,
  label,
  active = true,
}: {
  icon: typeof FileCode2
  label: string
  active?: boolean
}) {
  if (!active) return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
      <Icon size={10} className="shrink-0 text-[var(--bloom-lavender)]" />
      {label}
    </span>
  )
}

export function ContextBar({ summary }: ContextBarProps) {
  const hasAny =
    summary.hasActiveFile ||
    summary.hasSelection ||
    summary.openTabCount > 0 ||
    summary.structureEntryCount > 0

  if (!hasAny) {
    return (
      <p className="m-0 mb-2 text-[10px] text-[var(--text-muted)]">
        No editor context — open a file to include it in prompts.
      </p>
    )
  }

  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      <Chip
        icon={FileCode2}
        label={summary.activeFileName ?? 'Active file'}
        active={summary.hasActiveFile}
      />
      <Chip
        icon={TextSelect}
        label={summary.selectionLineRange ? `Selected ${summary.selectionLineRange}` : 'Selection'}
        active={summary.hasSelection}
      />
      <Chip
        icon={Files}
        label={`${summary.openTabCount} tab${summary.openTabCount === 1 ? '' : 's'}`}
        active={summary.openTabCount > 0}
      />
      <Chip
        icon={FolderTree}
        label={`${summary.structureEntryCount} paths`}
        active={summary.structureEntryCount > 0}
      />
    </div>
  )
}
