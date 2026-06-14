import type { EditorLanguage } from './types'

/** Languages with first-class Monaco support in Bloom IDE */
export const SUPPORTED_LANGUAGES: EditorLanguage[] = [
  'typescript',
  'javascript',
  'python',
  'java',
  'json',
  'css',
  'html',
  'markdown',
  'plaintext',
]

const EXTENSION_MAP: Record<string, EditorLanguage> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  pyw: 'python',
  java: 'java',
  json: 'json',
  css: 'css',
  html: 'html',
  htm: 'html',
  md: 'markdown',
  markdown: 'markdown',
}

export function resolveLanguage(fileName: string, hint?: string): EditorLanguage | string {
  if (hint && isSupportedLanguage(hint)) return hint

  const ext = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : undefined
  if (ext && ext in EXTENSION_MAP) return EXTENSION_MAP[ext]

  return 'plaintext'
}

export function isSupportedLanguage(lang: string): lang is EditorLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as EditorLanguage)
}

export function toMonacoLanguage(lang: string): string {
  return isSupportedLanguage(lang) ? lang : 'plaintext'
}

export function languageLabel(lang: string): string {
  const labels: Record<string, string> = {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    json: 'JSON',
    css: 'CSS',
    html: 'HTML',
    markdown: 'Markdown',
    plaintext: 'Plain Text',
  }
  return labels[lang] ?? lang
}
