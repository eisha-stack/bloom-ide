import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { registerMonacoThemes } from '../theme/monacoThemes'

let environmentReady = false

export function setupMonacoEnvironment() {
  if (environmentReady || typeof globalThis === 'undefined') return
  environmentReady = true

  ;(globalThis as Record<string, unknown>).MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      switch (label) {
        case 'json':
          return new jsonWorker()
        case 'css':
        case 'scss':
        case 'less':
          return new cssWorker()
        case 'html':
        case 'handlebars':
        case 'razor':
          return new htmlWorker()
        case 'typescript':
        case 'javascript':
          return new tsWorker()
        default:
          return new editorWorker()
      }
    },
  }
}

type MonacoTypeScript = {
  typescriptDefaults: {
    setCompilerOptions: (options: Record<string, unknown>) => void
    setDiagnosticsOptions: (options: Record<string, unknown>) => void
  }
  javascriptDefaults: {
    setCompilerOptions: (options: Record<string, unknown>) => void
  }
  ScriptTarget: { ES2022: number }
  ModuleKind: { ESNext: number }
  ModuleResolutionKind: { NodeJs: number }
  JsxEmit: { React: number }
}

export function configureMonacoLanguages(monaco: typeof import('monaco-editor')) {
  const ts = monaco.languages.typescript as unknown as MonacoTypeScript

  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2022,
    allowNonTsExtensions: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.React,
    esModuleInterop: true,
    noEmit: true,
  })

  ts.javascriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2022,
    allowNonTsExtensions: true,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.React,
    noEmit: true,
  })

  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })
}

export function initializeMonaco(monaco: typeof import('monaco-editor')) {
  setupMonacoEnvironment()
  registerMonacoThemes(monaco)
  configureMonacoLanguages(monaco)
}
