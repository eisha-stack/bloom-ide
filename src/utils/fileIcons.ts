import {
  FileCode2,
  FileJson,
  FileText,
  Palette,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { resolveLanguage } from '../editor/languageRegistry'

export function getFileIcon(name: string): LucideIcon {
  if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.js')) {
    return FileCode2
  }
  if (name.endsWith('.py')) return FileCode2
  if (name.endsWith('.java')) return FileCode2
  if (name.endsWith('.json')) return FileJson
  if (name.endsWith('.css')) return Palette
  if (name.endsWith('.config.ts') || name.endsWith('.config.js')) return Settings
  return FileText
}

export function languageFromFileName(name: string): string {
  return resolveLanguage(name)
}
