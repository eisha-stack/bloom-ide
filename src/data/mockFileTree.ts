import type { FileNode } from '../types/ide'

export const mockFileTree: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'src-components',
        name: 'components',
        type: 'folder',
        children: [
          {
            id: 'src-components-layout',
            name: 'layout',
            type: 'folder',
            children: [
              {
                id: 'activity-bar',
                name: 'ActivityBar.tsx',
                type: 'file',
                language: 'typescript',
              },
              {
                id: 'ide-shell',
                name: 'IDEShell.tsx',
                type: 'file',
                language: 'typescript',
              },
            ],
          },
          {
            id: 'src-components-explorer',
            name: 'explorer',
            type: 'folder',
            children: [
              {
                id: 'file-explorer',
                name: 'FileExplorer.tsx',
                type: 'file',
                language: 'typescript',
              },
              {
                id: 'file-tree',
                name: 'FileTree.tsx',
                type: 'file',
                language: 'typescript',
              },
            ],
          },
        ],
      },
      {
        id: 'app-tsx',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
      },
      {
        id: 'main-tsx',
        name: 'main.tsx',
        type: 'file',
        language: 'typescript',
      },
      {
        id: 'index-css',
        name: 'index.css',
        type: 'file',
        language: 'css',
      },
    ],
  },
  {
    id: 'package-json',
    name: 'package.json',
    type: 'file',
    language: 'json',
  },
  {
    id: 'readme',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
  },
  {
    id: 'vite-config',
    name: 'vite.config.ts',
    type: 'file',
    language: 'typescript',
  },
]

export const mockFileContents: Record<string, string> = {
  'app-tsx': `import { IDEShell } from './components/layout/IDEShell'

function App() {
  return <IDEShell />
}

export default App
`,
  'main-tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
  'index-css': `:root {
  --bloom-pink: #ffb6c1;
  --bloom-lavender: #cdb4db;
  --bg-main: #15131d;
}

body {
  background: var(--bg-main);
}
`,
  'activity-bar': `export function ActivityBar() {
  // Bloom IDE activity rail
  return null
}
`,
  'ide-shell': `export function IDEShell() {
  return (
    <div className="flex h-screen">
      {/* Activity bar + sidebar + editor */}
    </div>
  )
}
`,
  'file-explorer': `export function FileExplorer() {
  return (
    <div className="flex flex-col h-full">
      {/* File tree goes here */}
    </div>
  )
}
`,
  'file-tree': `export function FileTree() {
  return <ul role="tree" />
}
`,
  'package-json': `{
  "name": "bloom-ide",
  "version": "0.0.0",
  "private": true
}
`,
  readme: `# Bloom IDE

A modern coding IDE with a soft, premium aesthetic.
`,
  'vite-config': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
}
