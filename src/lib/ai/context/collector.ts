import { useEditorStore } from '../../../stores/editorStore'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import type { FileNode } from '../../../types/ide'
import { relativePathFromWorkspace } from './limits'
import type {
  LLMContext,
  LLMContextSummary,
  OpenTabContext,
  ProjectStructureEntry,
} from './types'

const SKIP_FOLDERS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'target'])

function flattenProjectStructure(
  nodes: FileNode[],
  workspacePath: string | null,
  maxEntries: number,
  depth = 0,
  parentPath = '',
): ProjectStructureEntry[] {
  const entries: ProjectStructureEntry[] = []

  for (const node of nodes) {
    if (entries.length >= maxEntries) break

    const relativePath = parentPath ? `${parentPath}/${node.name}` : node.name

    if (node.type === 'folder' && SKIP_FOLDERS.has(node.name)) {
      entries.push({
        path: relativePathFromWorkspace(workspacePath, node.id),
        name: node.name,
        type: 'folder',
        depth,
      })
      continue
    }

    entries.push({
      path: relativePathFromWorkspace(workspacePath, node.id),
      name: node.name,
      type: node.type,
      depth,
    })

    if (node.type === 'folder' && node.children?.length) {
      entries.push(
        ...flattenProjectStructure(
          node.children,
          workspacePath,
          maxEntries - entries.length,
          depth + 1,
          relativePath,
        ),
      )
    }
  }

  return entries
}

/** Gather a fresh IDE snapshot from Zustand stores (call at send time). */
export function collectLLMContext(maxStructureEntries = 150): LLMContext {
  const editor = useEditorStore.getState()
  const workspace = useWorkspaceStore.getState()
  const activeTab = editor.tabs.find((tab) => tab.id === editor.activeTabId) ?? null

  const openTabs: OpenTabContext[] = editor.tabs.map((tab) => ({
    path: relativePathFromWorkspace(workspace.workspacePath, tab.id),
    name: tab.name,
    language: String(tab.language),
    isActive: tab.id === editor.activeTabId,
    isDirty: tab.isDirty,
  }))

  const selection =
    activeTab?.selection && activeTab.selection.text.trim().length > 0
      ? activeTab.selection
      : null

  return {
    workspacePath: workspace.workspacePath,
    projectName: workspace.projectName,
    activeFile: activeTab
      ? {
          path: relativePathFromWorkspace(workspace.workspacePath, activeTab.id),
          name: activeTab.name,
          language: String(activeTab.language),
          content: activeTab.content,
          cursor: activeTab.cursor,
        }
      : null,
    selection,
    openTabs,
    projectStructure: flattenProjectStructure(
      workspace.rootNodes,
      workspace.workspacePath,
      maxStructureEntries,
    ),
  }
}

export function summarizeLLMContext(context: LLMContext): LLMContextSummary {
  const selectionLineRange = context.selection
    ? context.selection.startLine === context.selection.endLine
      ? `L${context.selection.startLine}`
      : `L${context.selection.startLine}–${context.selection.endLine}`
    : null

  return {
    hasActiveFile: context.activeFile !== null,
    hasSelection: context.selection !== null,
    openTabCount: context.openTabs.length,
    structureEntryCount: context.projectStructure.length,
    activeFileName: context.activeFile?.name ?? null,
    selectionLineRange,
  }
}
