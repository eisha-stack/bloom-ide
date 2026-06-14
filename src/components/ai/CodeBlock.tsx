import { Check, Copy } from 'lucide-react'
import { useCallback, useState } from 'react'
import { highlightCode } from '../../lib/ai/highlight'

type CodeBlockProps = {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const highlighted = highlightCode(code.replace(/\n$/, ''), language)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }, [code])

  return (
    <div className="ai-code-block group relative my-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5">
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label="Copy code"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="ai-code-pre m-0 overflow-x-auto p-3">
        <code
          className="hljs font-[family-name:var(--font-mono)] text-[11px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}
