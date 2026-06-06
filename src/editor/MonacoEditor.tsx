import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useCallback, useEffect, useRef } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import { useEditor } from './useEditor'
import { toMonacoLanguage } from './languageRegistry'
import { initializeMonaco } from './monacoSetup'

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
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
  wordWrap: 'off',
  tabSize: 2,
  insertSpaces: true,
  formatOnPaste: true,
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
}

export function MonacoEditor() {
  const { activeTab, activeTabId, updateContent, updateCursor } = useEditor()
  const { monacoThemeId } = useTheme()
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)

  const handleBeforeMount = useCallback((monaco: typeof import('monaco-editor')) => {
    monacoRef.current = monaco
    initializeMonaco(monaco)
  }, [])

  const handleMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance
      monacoRef.current = monaco
      monaco.editor.setTheme(monacoThemeId)

      if (activeTab) {
        editorInstance.setPosition({
          lineNumber: activeTab.cursor.line,
          column: activeTab.cursor.column,
        })
      }

      editorInstance.onDidChangeCursorPosition((e) => {
        updateCursor(e.position.lineNumber, e.position.column)
      })
    },
    [activeTab, monacoThemeId, updateCursor],
  )

  useEffect(() => {
    monacoRef.current?.editor.setTheme(monacoThemeId)
  }, [monacoThemeId])

  useEffect(() => {
    if (!editorRef.current || !activeTab) return
    editorRef.current.setPosition({
      lineNumber: activeTab.cursor.line,
      column: activeTab.cursor.column,
    })
  }, [activeTabId]) // restore cursor when switching tabs

  if (!activeTab || !activeTabId) return null

  const editorPath = `bloom://${activeTab.id}/${activeTab.name}`

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-editor)]">
      <Editor
        height="100%"
        path={editorPath}
        defaultValue={activeTab.content}
        language={toMonacoLanguage(activeTab.language)}
        theme={monacoThemeId}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={(value) => updateContent(activeTabId, value ?? '')}
        options={EDITOR_OPTIONS}
        loading={
          <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]">
            Loading editor…
          </div>
        }
      />
    </div>
  )
}
