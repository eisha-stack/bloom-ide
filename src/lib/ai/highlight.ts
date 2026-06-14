import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('tsx', typescript)
hljs.registerLanguage('javascript', typescript)
hljs.registerLanguage('jsx', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)

const ALIAS_MAP: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  yml: 'yaml',
  md: 'markdown',
}

export function highlightCode(code: string, language?: string): string {
  const normalized = language?.toLowerCase().trim()
  const lang = normalized ? (ALIAS_MAP[normalized] ?? normalized) : undefined

  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(code, { language: lang }).value
  }

  return hljs.highlightAuto(code).value
}
