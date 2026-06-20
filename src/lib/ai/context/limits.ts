import type { LLMContextBudget, LLMContextInclude } from './types'

export const DEFAULT_CONTEXT_BUDGET: LLMContextBudget = {
  maxFileChars: 12_000,
  maxSelectionChars: 4_000,
  maxStructureEntries: 150,
  maxOpenTabs: 20,
}

export const DEFAULT_CONTEXT_INCLUDE: LLMContextInclude = {
  activeFile: true,
  selection: true,
  openTabs: true,
  projectStructure: true,
}

export function truncateText(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) {
    return { text, truncated: false }
  }

  return {
    text: `${text.slice(0, maxChars)}\n… (truncated)`,
    truncated: true,
  }
}

export function relativePathFromWorkspace(workspacePath: string | null, filePath: string): string {
  if (!workspacePath) return filePath

  const normalizedRoot = workspacePath.replace(/\\/g, '/').replace(/\/$/, '')
  const normalizedFile = filePath.replace(/\\/g, '/')

  if (normalizedFile.startsWith(`${normalizedRoot}/`)) {
    return normalizedFile.slice(normalizedRoot.length + 1)
  }

  return filePath
}
