import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useCallback, useEffect, useRef } from 'react'
import { useTheme } from '../../theme/ThemeProvider'
import { registerMonacoThemes } from '../../theme/monacoThemes'

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
  const { monacoThemeId } = useTheme()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)

  const handleBeforeMount = useCallback((monaco: typeof import('monaco-editor')) => {
    monacoRef.current = monaco
    registerMonacoThemes(monaco)
  }, [])

  const handleMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance
      monacoRef.current = monaco
      monaco.editor.setTheme(monacoThemeId)

      editorInstance.onDidChangeCursorPosition((e) => {
        onCursorChange?.(e.position.lineNumber, e.position.column)
      })
    },
    [monacoThemeId, onCursorChange],
  )

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(monacoThemeId)
    }
  }, [monacoThemeId])

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={monacoThemeId}
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
