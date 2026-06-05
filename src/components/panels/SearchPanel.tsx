import { Search } from 'lucide-react'
import { useState } from 'react'

export function SearchPanel() {
  const [query, setQuery] = useState('')

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 py-3">
        <h2 className="m-0 font-[family-name:var(--font-heading)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Search
        </h2>
      </header>
      <div className="glass-panel mx-3 flex items-center gap-2 px-3 py-2">
        <Search size={14} className="text-[var(--text-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across files..."
          aria-label="Search across files"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>
      <p className="mt-6 px-4 text-center text-[12px] text-[var(--text-muted)]">
        {query ? `No results for "${query}"` : 'Type to search your workspace'}
      </p>
    </div>
  )
}
