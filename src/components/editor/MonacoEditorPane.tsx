import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useCallback, useRef } from 'react'
import { BLOOM_MONACO_THEME, bloomMonacoTheme } from '../../theme/monacoTheme'

type MonacoEditorPaneProps = {
  value: string
  language: string
  onChange: (value: string) => void
  onCursorChange?: (line: number, column: number) => void
}

export function MonacoEditorPane({
  value,
  language,
  onChange,
  onCursorChange,
}: MonacoEditorPaneProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleBeforeMount = useCallback((monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme(BLOOM_MONACO_THEME, bloomMonacoTheme)
  }, [])

  const handleMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance
      monaco.editor.setTheme(BLOOM_MONACO_THEME)

      editorInstance.onDidChangeCursorPosition((e) => {
        onCursorChange?.(e.position.lineNumber, e.position.column)
      })
    },
    [onCursorChange],
  )

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={BLOOM_MONACO_THEME}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={(v) => onChange(v ?? '')}
        options={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 14,
          lineHeight: 22,
          minimap: { enabled: true, scale: 1 },
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'line',
          bracketPairColorization: { enabled: true },
          guides: { indentation: true },
          roundedSelection: true,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
