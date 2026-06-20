import type { LLMContext } from './context/types'

export type CodeActionId = 'explain' | 'refactor' | 'fix-bug' | 'optimize' | 'generate-tests'

export type CodeAction = {
  id: CodeActionId
  label: string
  description: string
}

export const CODE_ACTIONS: CodeAction[] = [
  {
    id: 'explain',
    label: 'Explain Code',
    description: 'Break down what the selection does',
  },
  {
    id: 'refactor',
    label: 'Refactor Code',
    description: 'Improve structure and readability',
  },
  {
    id: 'fix-bug',
    label: 'Fix Bug',
    description: 'Find issues and suggest fixes',
  },
  {
    id: 'optimize',
    label: 'Optimize',
    description: 'Improve performance and efficiency',
  },
  {
    id: 'generate-tests',
    label: 'Generate Tests',
    description: 'Create unit tests for the selection',
  },
]

const ACTION_INSTRUCTIONS: Record<CodeActionId, string> = {
  explain:
    'Explain the selected code step by step. Cover its purpose, inputs and outputs, and any non-obvious behavior.',
  refactor:
    'Refactor the selected code for clarity and maintainability. Show the improved version and briefly explain each change.',
  'fix-bug':
    'Analyze the selected code for bugs or edge-case failures. Provide a corrected version with clear explanations.',
  optimize:
    'Suggest performance and efficiency improvements for the selected code. Include optimized code where helpful.',
  'generate-tests':
    'Generate comprehensive unit tests for the selected code. Include edge cases and match the likely test framework for this project.',
}

function formatLineRange(context: LLMContext): string {
  const selection = context.selection
  if (!selection) return ''

  return selection.startLine === selection.endLine
    ? `line ${selection.startLine}`
    : `lines ${selection.startLine}–${selection.endLine}`
}

/** Build a user message that embeds the current editor selection. */
export function buildCodeActionPrompt(actionId: CodeActionId, context: LLMContext): string {
  const selection = context.selection
  if (!selection?.text.trim()) {
    throw new Error('Select code in the editor before running this action.')
  }

  const instruction = ACTION_INSTRUCTIONS[actionId]
  const file = context.activeFile
  const lang = file?.language ?? ''
  const range = formatLineRange(context)
  const fileRef = file ? ` from \`${file.path}\`${range ? ` (${range})` : ''}` : range ? ` (${range})` : ''

  return `${instruction}

Selected code${fileRef}:

\`\`\`${lang}
${selection.text}
\`\`\``
}

export function getCodeAction(actionId: CodeActionId): CodeAction | undefined {
  return CODE_ACTIONS.find((action) => action.id === actionId)
}
