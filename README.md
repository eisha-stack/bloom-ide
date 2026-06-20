# BloomCode

**BloomCode** is a desktop code editor with a VS Code–inspired layout, a built-in AI assistant, integrated terminal, and Git source control. The UI is built with React and styled around a soft pink-and-lavender aesthetic. The native shell is powered by [Tauri 2](https://v2.tauri.app/), so the app stays lightweight while still accessing the filesystem, shell, and Git on your machine.

> **Note:** The npm package is named `bloom-ide`; the desktop app product name is **BloomCode**.

---

## Features

### Editor

- **Monaco Editor** with syntax highlighting for TypeScript, JavaScript, Python, Java, JSON, CSS, HTML, Markdown, and plain text
- Multi-tab editing with dirty-state tracking and a status bar (language, cursor position, save state)
- **Auto-save** (optional, configurable in Settings)
- Custom Monaco themes synced with the app theme

### Workspace & Files

- Open a local folder via the native folder picker (desktop only)
- Lazy-loaded file tree with expand/collapse
- Create, rename, delete, read, and write files through Tauri commands
- **Browser preview mode:** when not running inside Tauri, a mock project tree is used so the UI can be developed without the desktop shell

### AI Assistant

- Side panel chat with streaming responses and conversation history
- **Context-aware prompts** — automatically includes open tabs, active file, text selection, and a snapshot of the project structure
- **Code actions** on the current selection: Explain, Refactor, Fix Bug, Optimize, Generate Tests
- **Providers:**
  - **Mock** — local demo responses, no API key required
  - **OpenRouter** — real LLM access (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, Llama 3.3 70B, and more)
- Suggested prompts and markdown rendering with syntax-highlighted code blocks

### Terminal

- Embedded **xterm.js** terminal with multiple tabs
- Spawns a real shell via `portable-pty` (PowerShell, bash, etc.) with cwd defaulting to the open workspace
- Resizable bottom panel; toggle with **Ctrl/Cmd + `**

### Source Control

- Git status view: branch name, staged/unstaged/untracked changes
- Stage all, stage individual files, and create commits
- Badge on the activity bar showing pending change count

### Themes

Three first-class themes with matching Monaco and terminal styling:

| Theme | Mode | Description |
|-------|------|-------------|
| **Bloom Dark** | Dark | Deep purple nights with pink glow accents (default) |
| **Sakura Blossom** | Light | Soft cherry-blossom spring palette |
| **Lavender Dreams** | Dark | Cozy lavender fields — premium night coding |

### UI Shell

- Activity bar: Explorer, Search, Source Control, Extensions (placeholder), AI Assistant, Settings
- Animated landing screen when no file is open
- Framer Motion transitions throughout

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React UI (Vite + TypeScript + Tailwind CSS 4)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Zustand  │ │ Monaco   │ │ xterm.js │ │ AI providers  │  │
│  │ stores   │ │ Editor   │ │ terminal │ │ (mock/OpenRouter)│ │
│  └────┬─────┘ └──────────┘ └────┬─────┘ └───────┬───────┘  │
│       │                         │               │          │
│       └─────────────┬───────────┴───────────────┘          │
│                     │ @tauri-apps/api invoke               │
├─────────────────────┼──────────────────────────────────────┤
│  Tauri 2 (Rust)     │                                        │
│  ┌──────────────────┴──────────────────────────────────┐     │
│  │ fs · git · terminal · dialog                       │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Role |
|-------|------|
| **Frontend** | React 19 SPA — layout, editor, AI chat, state |
| **State** | Zustand stores: `editorStore`, `workspaceStore`, `aiStore`, `terminalStore`, `scmStore`, `settingsStore` |
| **Backend** | Rust modules: filesystem, Git (subprocess), PTY terminal |
| **Bridge** | Tauri commands exposed from `src-tauri/src/lib.rs` |

---

## Prerequisites

### All development

- **Node.js** 18+ (20+ recommended)
- **npm** 9+

### Desktop app (Tauri)

- **Rust** 1.77+ ([rustup](https://rustup.rs/))
- Platform tooling for Tauri 2:
  - **Windows:** Microsoft C++ Build Tools and WebView2 (usually preinstalled on Windows 10/11)
  - **macOS:** Xcode Command Line Tools
  - **Linux:** `build-essential`, `libwebkit2gtk-4.1-dev`, and related packages — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Optional (AI)

- An [OpenRouter](https://openrouter.ai/) API key if you want live LLM responses instead of the mock provider

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Web-only development (UI work)

Runs the Vite dev server without the Tauri shell. Filesystem, terminal, and Git features use mocks or are limited.

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Desktop development (full features)

Starts Vite and launches the Tauri window with native backend access:

```bash
npm run tauri:dev
```

### Production builds

**Web static build:**

```bash
npm run build
npm run preview   # serve dist/ locally
```

**Desktop installer / bundle:**

```bash
npm run tauri:build
```

Artifacts are written under `src-tauri/target/release/bundle/`.

---

## Configuration

### AI provider

Open **Settings** (gear icon in the activity bar):

1. Choose **Mock** (default) or **OpenRouter**
2. For OpenRouter, paste your API key and pick a model
3. Settings persist in `localStorage` under the key `bloomcode-settings`

Supported OpenRouter models (configurable in Settings):

- `openai/gpt-4o-mini` (default)
- `openai/gpt-4o`
- `anthropic/claude-3.5-sonnet`
- `google/gemini-2.0-flash-001`
- `meta-llama/llama-3.3-70b-instruct`

### Auto-save

Enable **Auto-save** in Settings to save the active tab automatically after edits.

### Theme

Pick a theme in Settings. The choice applies to the shell, Monaco editor, and terminal simultaneously.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl/Cmd + S** | Save active file |
| **Ctrl/Cmd + `** | Toggle terminal panel |

---

## Project Structure

```
bloom-ide/
├── src/                          # React frontend
│   ├── components/
│   │   ├── ai/                   # AI assistant panel, chat, code actions
│   │   ├── explorer/             # File tree and search input
│   │   ├── landing/              # Empty-state welcome screen
│   │   ├── layout/               # IDEShell, activity bar, tabs, status bar
│   │   ├── panels/               # Search, settings, placeholders
│   │   ├── scm/                  # Git source control panel
│   │   ├── terminal/             # xterm panel and tab bar
│   │   └── ui/                   # Shared UI primitives
│   ├── editor/                   # Monaco setup, models, language registry
│   ├── hooks/                    # Shortcuts, auto-save, LLM context
│   ├── lib/
│   │   ├── ai/                   # Providers, context collector, code actions
│   │   ├── fs/                   # File tree helpers
│   │   ├── tauri/                # Typed Tauri invoke wrappers
│   │   └── terminal/             # xterm theme sync
│   ├── stores/                   # Zustand state (editor, workspace, AI, …)
│   ├── theme/                    # Theme definitions and CSS variables
│   └── types/                    # Shared TypeScript types
├── src-tauri/                    # Tauri / Rust backend
│   ├── src/
│   │   ├── fs/                   # open_folder, read/write, list_dir, …
│   │   ├── git/                  # status, stage, commit
│   │   ├── terminal/             # PTY spawn, write, resize, kill
│   │   └── lib.rs                # Command registration and app entry
│   ├── capabilities/             # Tauri 2 capability permissions
│   └── tauri.conf.json           # App metadata and bundle config
├── public/                       # Static assets
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Tech Stack

| Category | Libraries |
|----------|-----------|
| **UI** | React 19, Tailwind CSS 4, Framer Motion, Lucide icons |
| **Editor** | Monaco Editor, `@monaco-editor/react` |
| **Terminal** | xterm.js 6, `@xterm/addon-fit`, `@xterm/addon-web-links` |
| **State** | Zustand |
| **AI** | OpenRouter API (SSE streaming), react-markdown, remark-gfm, highlight.js |
| **Desktop** | Tauri 2, tauri-plugin-dialog, portable-pty |
| **Build** | Vite 8, TypeScript 6, esbuild |

---

## Tauri Commands

The Rust backend exposes these invoke targets (see `src-tauri/src/lib.rs`):

**Filesystem:** `open_folder`, `get_workspace`, `read_file`, `write_file`, `create_file`, `delete_file`, `rename_file`, `list_dir`

**Terminal:** `terminal_list_shells`, `terminal_spawn`, `terminal_write`, `terminal_resize`, `terminal_kill`, `terminal_execute`

**Git:** `git_get_status`, `git_stage_all_files`, `git_stage_files`, `git_create_commit`

---

## Current Limitations

These areas exist in the UI but are not fully implemented yet:

- **Search panel** — input only; no workspace-wide search results
- **Extensions panel** — placeholder
- **Clone repository** landing action — opens demo content, not a real clone flow
- **Web mode** — no real filesystem, terminal, or Git; use `tauri:dev` for full functionality

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Typecheck + production web build → `dist/` |
| `npm run preview` | Preview the production web build |
| `npm run tauri` | Tauri CLI passthrough |
| `npm run tauri:dev` | Desktop app in development mode |
| `npm run tauri:build` | Build signed/bundled desktop app |

---

## License

MIT
