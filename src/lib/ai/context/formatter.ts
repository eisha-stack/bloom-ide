import { collectLLMContext } from './collector'
import {
  DEFAULT_CONTEXT_BUDGET,
  DEFAULT_CONTEXT_INCLUDE,
  truncateText,
} from './limits'
import type { LLMContext, LLMContextFormatOptions } from './types'

const BASE_INSTRUCTIONS = [
  'You are Bloom AI, a helpful coding assistant inside the BloomCode IDE.',
  'Respond with clear explanations and use markdown.',
  'Wrap code in fenced code blocks with the correct language tag.',
  'When the user asks about "this file" or "selected code", use the IDE context below.',
].join('\n')

function formatWorkspaceSection(context: LLMContext): string | null {
  if (!context.workspacePath && !context.projectName) return null

  const lines = ['## Workspace']
  if (context.projectName) lines.push(`- Project: ${context.projectName}`)
  if (context.workspacePath) lines.push(`- Root: ${context.workspacePath}`)
  return lines.join('\n')
}

function formatOpenTabsSection(context: LLMContext, maxOpenTabs: number): string | null {
  if (context.openTabs.length === 0) return null

  const tabs = context.openTabs.slice(0, maxOpenTabs)
  const lines = tabs.map((tab) => {
    const flags = [tab.isActive ? 'active' : null, tab.isDirty ? 'unsaved' : null]
      .filter(Boolean)
      .join(', ')
    const suffix = flags ? ` (${flags})` : ''
    return `- ${tab.path} [${tab.language}]${suffix}`
  })

  if (context.openTabs.length > maxOpenTabs) {
    lines.push(`… and ${context.openTabs.length - maxOpenTabs} more tab(s)`)
  }

  return `## Open tabs\n${lines.join('\n')}`
}

function formatProjectStructureSection(
  context: LLMContext,
  maxStructureEntries: number,
): string | null {
  if (context.projectStructure.length === 0) return null

  const entries = context.projectStructure.slice(0, maxStructureEntries)
  const lines = entries.map((entry) => {
    const indent = '  '.repeat(entry.depth)
    const suffix = entry.type === 'folder' ? '/' : ''
    return `${indent}${entry.name}${suffix}`
  })

  if (context.projectStructure.length > maxStructureEntries) {
    lines.push(`… (${context.projectStructure.length - maxStructureEntries} more entries omitted)`)
  }

  return `## Project structure\n\`\`\`\n${lines.join('\n')}\n\`\`\``
}

function formatSelectionSection(
  context: LLMContext,
  maxSelectionChars: number,
): string | null {
  if (!context.selection || !context.activeFile) return null

  const { text, truncated } = truncateText(context.selection.text, maxSelectionChars)
  const range =
    context.selection.startLine === context.selection.endLine
      ? `line ${context.selection.startLine}`
      : `lines ${context.selection.startLine}–${context.selection.endLine}`

  return [
    `## Selected code`,
    `- File: ${context.activeFile.path}`,
    `- Range: ${range}`,
    truncated ? '- Note: selection was truncated for context limits' : null,
    `\`\`\`${context.activeFile.language}`,
    text,
    '```',
  ]
    .filter(Boolean)
    .join('\n')
}

function formatActiveFileSection(context: LLMContext, maxFileChars: number): string | null {
  if (!context.activeFile) return null

  const { text, truncated } = truncateText(context.activeFile.content, maxFileChars)

  return [
    `## Active file: ${context.activeFile.path}`,
    `- Language: ${context.activeFile.language}`,
    `- Cursor: line ${context.activeFile.cursor.line}, column ${context.activeFile.cursor.column}`,
    truncated ? '- Note: file content was truncated for context limits' : null,
    `\`\`\`${context.activeFile.language}`,
    text,
    '```',
  ]
    .filter(Boolean)
    .join('\n')
}

/** Serialize LLMContext into a system prompt for chat-completions APIs. */
export function buildContextSystemPrompt(
  context: LLMContext,
  options?: LLMContextFormatOptions,
): string {
  const budget = { ...DEFAULT_CONTEXT_BUDGET, ...options?.budget }
  const include = { ...DEFAULT_CONTEXT_INCLUDE, ...options?.include }

  const sections = [BASE_INSTRUCTIONS, formatWorkspaceSection(context)]

  if (include.projectStructure) {
    sections.push(formatProjectStructureSection(context, budget.maxStructureEntries))
  }

  if (include.openTabs) {
    sections.push(formatOpenTabsSection(context, budget.maxOpenTabs))
  }

  if (include.selection) {
    sections.push(formatSelectionSection(context, budget.maxSelectionChars))
  }

  if (include.activeFile) {
    sections.push(formatActiveFileSection(context, budget.maxFileChars))
  }

  return sections.filter((section): section is string => Boolean(section)).join('\n\n')
}

/** Convenience: collect + format in one call at message send time. */
export function buildPromptFromIDE(options?: LLMContextFormatOptions): string {
  return buildContextSystemPrompt(collectLLMContext(), options)
}
