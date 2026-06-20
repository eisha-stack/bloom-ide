export type EditorSelectionContext = {
  text: string
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

export type ActiveFileContext = {
  path: string
  name: string
  language: string
  content: string
  cursor: { line: number; column: number }
}

export type OpenTabContext = {
  path: string
  name: string
  language: string
  isActive: boolean
  isDirty: boolean
}

export type ProjectStructureEntry = {
  path: string
  name: string
  type: 'file' | 'folder'
  depth: number
}

/** Structured IDE snapshot sent to LLM providers. */
export type LLMContext = {
  workspacePath: string | null
  projectName: string | null
  activeFile: ActiveFileContext | null
  selection: EditorSelectionContext | null
  openTabs: OpenTabContext[]
  projectStructure: ProjectStructureEntry[]
}

export type LLMContextBudget = {
  maxFileChars: number
  maxSelectionChars: number
  maxStructureEntries: number
  maxOpenTabs: number
}

export type LLMContextInclude = {
  activeFile: boolean
  selection: boolean
  openTabs: boolean
  projectStructure: boolean
}

export type LLMContextFormatOptions = {
  budget?: Partial<LLMContextBudget>
  include?: Partial<LLMContextInclude>
}

export type LLMContextSummary = {
  hasActiveFile: boolean
  hasSelection: boolean
  openTabCount: number
  structureEntryCount: number
  activeFileName: string | null
  selectionLineRange: string | null
}

/** @deprecated Use LLMContext */
export type ChatContext = LLMContext
