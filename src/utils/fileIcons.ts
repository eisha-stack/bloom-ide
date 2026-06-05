import {
  FileCode2,
  FileJson,
  FileText,
  Palette,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export function getFileIcon(name: string): LucideIcon {
  if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.js')) {
    return FileCode2
  }
  if (name.endsWith('.json')) return FileJson
  if (name.endsWith('.css')) return Palette
  if (name.endsWith('.config.ts') || name.endsWith('.config.js')) return Settings
  return FileText
}

export function languageFromFileName(name: string): string {
  if (name.endsWith('.tsx')) return 'typescript'
  if (name.endsWith('.ts')) return 'typescript'
  if (name.endsWith('.jsx')) return 'javascript'
  if (name.endsWith('.js')) return 'javascript'
  if (name.endsWith('.json')) return 'json'
  if (name.endsWith('.css')) return 'css'
  if (name.endsWith('.md')) return 'markdown'
  return 'plaintext'
}
