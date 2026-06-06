import type { editor } from 'monaco-editor'
import { useCallback, useEffect, useRef } from 'react'
import { toMonacoLanguage } from './languageRegistry'
import type { EditorDocument } from './types'

type Monaco = typeof import('monaco-editor')

function uriForTab(tab: EditorDocument, monaco: Monaco) {
  return monaco.Uri.parse(`inmemory://bloom/${tab.id}/${tab.name}`)
}

export function useMonacoModels() {
  const modelsRef = useRef<Map<string, editor.ITextModel>>(new Map())

  const syncModels = useCallback((monaco: Monaco, tabs: EditorDocument[]) => {
    const openIds = new Set(tabs.map((tab) => tab.id))

    for (const tab of tabs) {
      const existing = modelsRef.current.get(tab.id)
      const language = toMonacoLanguage(tab.language)

      if (!existing) {
        const model = monaco.editor.createModel(tab.content, language, uriForTab(tab, monaco))
        modelsRef.current.set(tab.id, model)
        continue
      }

      if (existing.getLanguageId() !== language) {
        monaco.editor.setModelLanguage(existing, language)
      }

      if (existing.getValue() !== tab.content) {
        existing.setValue(tab.content)
      }
    }

    for (const [id, model] of modelsRef.current) {
      if (!openIds.has(id)) {
        model.dispose()
        modelsRef.current.delete(id)
      }
    }
  }, [])

  const getModel = useCallback((tabId: string) => modelsRef.current.get(tabId) ?? null, [])

  const disposeAll = useCallback(() => {
    for (const model of modelsRef.current.values()) {
      model.dispose()
    }
    modelsRef.current.clear()
  }, [])

  useEffect(() => () => disposeAll(), [disposeAll])

  return { syncModels, getModel, disposeAll }
}
