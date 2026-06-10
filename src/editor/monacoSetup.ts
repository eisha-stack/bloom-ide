import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker.js?url'
import cssWorkerUrl from 'monaco-editor/esm/vs/language/css/css.worker.js?url'
import htmlWorkerUrl from 'monaco-editor/esm/vs/language/html/html.worker.js?url'
import jsonWorkerUrl from 'monaco-editor/esm/vs/language/json/json.worker.js?url'
import tsWorkerUrl from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?url'
import { registerMonacoThemes } from '../theme/monacoThemes'

let environmentReady = false

function workerUrlForLabel(label: string): string {
  switch (label) {
    case 'json':
      return jsonWorkerUrl
    case 'css':
    case 'scss':
    case 'less':
      return cssWorkerUrl
    case 'html':
    case 'handlebars':
    case 'razor':
      return htmlWorkerUrl
    case 'typescript':
    case 'javascript':
      return tsWorkerUrl
    default:
      return editorWorkerUrl
  }
}

export function setupMonacoEnvironment() {
  if (environmentReady || typeof globalThis === 'undefined') return
  environmentReady = true

  ;(globalThis as Record<string, unknown>).MonacoEnvironment = {
    getWorker(_workerId: string, label: string) {
      return new Worker(workerUrlForLabel(label), { type: 'module', name: label })
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
