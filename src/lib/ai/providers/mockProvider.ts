import type { AIProvider, ChatCompletionRequest, StreamChunk } from '../types'

const STREAM_CHAR_DELAY_MS = 12
const STREAM_CHUNK_SIZE = 3

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function buildMockResponse(request: ChatCompletionRequest): string {
  const lastUser = [...request.messages].reverse().find((m) => m.role === 'user')
  const prompt = lastUser?.content ?? ''
  const file = request.context.activeFileName
  const lang = request.context.language ?? 'typescript'

  if (/explain|what does|how does/i.test(prompt)) {
    return `# Explanation

${file ? `Looking at **${file}**:\n\n` : ''}Here's a breakdown of what you're asking about:

1. **Purpose** — The code handles a specific workflow in your app.
2. **Key parts** — State, effects, and side effects work together.
3. **Gotchas** — Watch for stale closures and missing dependencies.

\`\`\`${lang}
function example(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return null
  return trimmed.toUpperCase()
}
\`\`\`

> Tip: Add unit tests around edge cases like empty strings and null inputs.`
  }

  if (/fix|bug|error|debug/i.test(prompt)) {
    return `# Bug fix suggestions

I found a few likely issues${file ? ` in \`${file}\`` : ''}:

- **Null checks** — Guard optional values before access.
- **Async handling** — Ensure errors are caught in \`try/catch\`.
- **Type safety** — Narrow union types before use.

\`\`\`${lang}
try {
  const result = await fetchData()
  setState(result)
} catch (error) {
  console.error('Failed to load:', error)
}
\`\`\`

Apply these changes and re-run your tests.`
  }

  if (/generate|component|create|write/i.test(prompt)) {
    return `# Generated code

Here's a starter ${lang === 'tsx' || lang === 'typescript' ? 'React component' : 'module'}${file ? ` for **${file}**` : ''}:

\`\`\`tsx
import { useState } from 'react'

type Props = {
  title: string
  onSubmit: (value: string) => void
}

export function GeneratedPanel({ title, onSubmit }: Props) {
  const [value, setValue] = useState('')

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 w-full rounded border px-2 py-1"
      />
      <button
        type="button"
        onClick={() => onSubmit(value)}
        className="mt-2 rounded bg-purple-600 px-3 py-1 text-white"
      >
        Submit
      </button>
    </section>
  )
}
\`\`\`

You can paste this into your project and adjust styling to match BloomCode themes.`
  }

  if (/optimize|performance|faster/i.test(prompt)) {
    return `# Optimization ideas

${file ? `For \`${file}\`, consider:\n\n` : ''}- **Memoization** — Wrap expensive computations in \`useMemo\`.
- **Callbacks** — Stabilize handlers with \`useCallback\`.
- **Lazy loading** — Split heavy routes with \`React.lazy\`.

\`\`\`${lang}
const sorted = useMemo(
  () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [items],
)
\`\`\`

Profile first with React DevTools to confirm the bottleneck.`
  }

  return `# Bloom AI

Thanks for your message${file ? ` about **${file}**` : ''}.

I can help you:
- **Explain** code and architecture
- **Fix** bugs and errors
- **Generate** components and utilities
- **Optimize** performance

Try asking something like *"Explain this function"* or *"Generate a React component"*.

\`\`\`${lang}
// Example: quick utility
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
\`\`\`

*(Mock provider — connect a real AI backend when ready.)*`
}

async function* streamText(text: string, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
  let index = 0

  while (index < text.length) {
    if (signal?.aborted) {
      yield { type: 'error', error: 'Generation stopped.' }
      return
    }

    const chunk = text.slice(index, index + STREAM_CHUNK_SIZE)
    index += STREAM_CHUNK_SIZE
    yield { type: 'delta', content: chunk }
    await sleep(STREAM_CHAR_DELAY_MS, signal)
  }

  yield { type: 'done' }
}

export const mockProvider: AIProvider = {
  id: 'mock',
  name: 'Mock (Demo)',
  supportsStreaming: true,

  async *streamChat(request: ChatCompletionRequest) {
    const response = buildMockResponse(request)
    yield* streamText(response, request.signal)
  },
}
