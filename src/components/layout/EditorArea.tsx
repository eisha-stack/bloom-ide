import { Sparkles } from 'lucide-react'

type EditorAreaProps = {
  fileName: string | null
  language: string | null
  content: string
}

export function EditorArea({ fileName, language, content }: EditorAreaProps) {
  if (!fileName) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--bg-editor)] p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-[rgba(184,162,227,0.12)] shadow-[0_0_32px_rgba(168,85,247,0.15)]">
          <Sparkles size={28} className="text-[var(--bloom-lavender)]" />
        </div>
        <div className="text-center">
          <h2 className="m-0 mb-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
            Welcome to Bloom IDE
          </h2>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            Open a file from the explorer to start coding
          </p>
        </div>
      </div>
    )
  }

  const lines = content.split('\n')

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[var(--bg-editor)]">
      <div
        aria-hidden
        className="shrink-0 select-none border-r border-[var(--border-subtle)] py-3 pr-3 text-right font-[family-name:var(--font-mono)] text-[13px] leading-[1.6] text-[var(--text-muted)]"
      >
        {lines.map((_, i) => (
          <div key={i} className="px-3">
            {i + 1}
          </div>
        ))}
      </div>
      <pre className="m-0 min-w-0 flex-1 overflow-auto p-3 font-[family-name:var(--font-mono)] text-[13px] leading-[1.6] text-[var(--text-primary)]">
        <code>{content}</code>
      </pre>
      <span className="sr-only">
        Editing {fileName}, language {language}
      </span>
    </div>
  )
}
