import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import { useEditor } from './useEditor'
import { toMonacoLanguage } from './languageRegistry'
import { initializeMonaco } from './monacoSetup'

const EDITOR_FONT = "'JetBrains Mono', ui-monospace, monospace"

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: EDITOR_FONT,
  fontSize: 14,
  lineHeight: 0,
  fontLigatures: false,
  minimap: { enabled: true, scale: 1 },
  scrollBeyondLastLine: false,
  padding: { top: 12, bottom: 12 },
  smoothScrolling: true,
  cursorBlinking: 'solid',
  cursorSmoothCaretAnimation: 'off',
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
  occurrencesHighlight: 'off',
  selectionHighlight: false,
}

function toEditorPath(tabId: string): string {
  return `bloom://${encodeURIComponent(tabId).replace(/%/g, '_')}`
}

function remeasureEditorFonts(
  editorInstance: editor.IStandaloneCodeEditor,
  monaco: typeof import('monaco-editor'),
) {
  void document.fonts.ready.then(() => {
    monaco.editor.remeasureFonts()
    editorInstance.layout()
  })
}

export function MonacoEditor() {
  const { activeTab, activeTabId, updateContent, updateCursor } = useEditor()
  const { monacoThemeId } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect()
      const w = Math.floor(width)
      const h = Math.floor(height)
      if (w > 0 && h > 0) {
        setDimensions({ width: w, height: h })
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [activeTabId])

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

      remeasureEditorFonts(editorInstance, monaco)
    },
    [activeTab, monacoThemeId, updateCursor],
  )

  useEffect(() => {
    monacoRef.current?.editor.setTheme(monacoThemeId)
  }, [monacoThemeId])

  // Restore cursor only when switching tabs — not on every content keystroke.
  useEffect(() => {
    const editorInstance = editorRef.current
    const monaco = monacoRef.current
    if (!editorInstance || !activeTab) return

    editorInstance.setPosition({
      lineNumber: activeTab.cursor.line,
      column: activeTab.cursor.column,
    })
    remeasureEditorFonts(editorInstance, monaco!)
  }, [activeTabId])

  if (!activeTab || !activeTabId) return null

  return (
    <div
      ref={containerRef}
      className="monaco-editor-host min-h-0 flex-1 overflow-hidden bg-[var(--bg-editor)]"
    >
      {dimensions.height > 0 && dimensions.width > 0 && (
        <Editor
          key={activeTabId}
          height={dimensions.height}
          width={dimensions.width}
          path={toEditorPath(activeTabId)}
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
      )}
    </div>
  )
}
