import { Search as SearchIcon } from 'lucide-react'

type FileSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function FileSearch({ value, onChange }: FileSearchProps) {
  return (
    <div className="glass-panel mx-3 mb-2 flex items-center gap-2 px-3 py-2 transition-[box-shadow,border-color] duration-200 focus-within:border-[rgba(168,85,247,0.4)] focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.15)]">
      <SearchIcon size={14} className="shrink-0 text-[var(--text-muted)]" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files..."
        aria-label="Search files"
        className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
      />
    </div>
  )
}
