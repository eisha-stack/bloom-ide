import type { editor } from 'monaco-editor'

export const BLOOM_MONACO_THEME = 'bloom-dark'

export const bloomMonacoTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6B5F7A', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'FF69B4' },
    { token: 'keyword.control', foreground: 'CDB4DB' },
    { token: 'string', foreground: '86EFAC' },
    { token: 'number', foreground: 'FFC8DD' },
    { token: 'type', foreground: 'B8A2E3' },
    { token: 'type.identifier', foreground: 'B8A2E3' },
    { token: 'identifier', foreground: 'E5D9F2' },
    { token: 'delimiter', foreground: 'A89BB8' },
    { token: 'operator', foreground: 'FFB6C1' },
    { token: 'function', foreground: 'A855F7' },
    { token: 'variable', foreground: 'F5F0FA' },
    { token: 'tag', foreground: 'FF69B4' },
    { token: 'attribute.name', foreground: 'CDB4DB' },
    { token: 'attribute.value', foreground: '86EFAC' },
  ],
  colors: {
    'editor.background': '#211D2E',
    'editor.foreground': '#F5F0FA',
    'editor.lineHighlightBackground': '#2A243855',
    'editor.selectionBackground': '#CDB4DB40',
    'editor.inactiveSelectionBackground': '#B8A2E325',
    'editorCursor.foreground': '#FF69B4',
    'editorLineNumber.foreground': '#6B5F7A',
    'editorLineNumber.activeForeground': '#A89BB8',
    'editorIndentGuide.background': '#2A2438',
    'editorIndentGuide.activeBackground': '#CDB4DB40',
    'editorGutter.background': '#211D2E',
    'editorWidget.background': '#2A2438',
    'editorWidget.border': '#CDB4DB20',
    'minimap.background': '#1B1826',
    'scrollbarSlider.background': '#CDB4DB25',
    'scrollbarSlider.hoverBackground': '#CDB4DB40',
  },
}
