import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { MonacoEditorPane } from '../editor/MonacoEditorPane'

type EditorAreaProps = {
  fileName: string | null
  language: string | null
  content: string
  onChange: (value: string) => void
  onCursorChange?: (line: number, column: number) => void
}

export function EditorArea({
  fileName,
  language,
  content,
  onChange,
  onCursorChange,
}: EditorAreaProps) {
  if (!fileName || !language) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden bg-[var(--bg-editor)] p-8"
      >
        {/* Subtle sparkle decorations */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[20%] top-[25%] h-1 w-1 rounded-full bg-[var(--bloom-lilac)] opacity-40"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-[25%] top-[35%] h-1.5 w-1.5 rounded-full bg-[var(--bloom-pink)] opacity-30"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[30%] left-[30%] h-1 w-1 rounded-full bg-[var(--bloom-lavender)] opacity-35"
        />

        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-[rgba(184,162,227,0.12)] shadow-[0_0_32px_rgba(168,85,247,0.15)]"
        >
          <Sparkles size={28} className="text-[var(--bloom-lavender)]" />
        </motion.div>
        <div className="text-center">
          <h2 className="m-0 mb-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
            Welcome to Bloom IDE
          </h2>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            Open a file from the explorer to start coding
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-editor)]">
      <MonacoEditorPane
        value={content}
        language={language}
        onChange={onChange}
        onCursorChange={onCursorChange}
      />
    </div>
  )
}
