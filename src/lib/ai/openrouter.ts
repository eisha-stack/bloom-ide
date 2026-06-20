import type { ChatCompletionRequest, StreamChunk } from './types'
import { buildContextSystemPrompt } from './context/formatter'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export const DEFAULT_OPENROUTER_MODEL = 'openai/gpt-4o-mini'

export const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (fast, affordable)' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
] as const

function toApiMessages(
  messages: ChatCompletionRequest['messages'],
  context: ChatCompletionRequest['context'],
): Array<{ role: string; content: string }> {
  const chatMessages = messages
    .filter((m) => m.role !== 'system' && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))

  return [{ role: 'system', content: buildContextSystemPrompt(context) }, ...chatMessages]
}

function parseErrorMessage(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } }
    if (parsed.error?.message) return parsed.error.message
  } catch {
    /* use fallback */
  }

  if (status === 401) return 'Invalid OpenRouter API key. Check Settings → AI.'
  if (status === 402) return 'OpenRouter credits exhausted. Add credits at openrouter.ai.'
  if (status === 429) return 'Rate limit reached. Wait a moment and try again.'
  return `OpenRouter request failed (${status}).`
}

async function* readSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    if (signal?.aborted) {
      yield { type: 'error', error: 'Generation stopped.' }
      return
    }

    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const data = trimmed.slice(5).trim()
      if (!data || data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>
          error?: { message?: string }
        }

        if (parsed.error?.message) {
          yield { type: 'error', error: parsed.error.message }
          return
        }

        const content = parsed.choices?.[0]?.delta?.content
        if (content) {
          yield { type: 'delta', content }
        }
      } catch {
        /* ignore malformed SSE chunks */
      }
    }
  }

  yield { type: 'done' }
}

export async function* streamOpenRouterChat(
  request: ChatCompletionRequest,
): AsyncGenerator<StreamChunk> {
  const apiKey = request.config?.openRouterApiKey?.trim()
  if (!apiKey) {
    yield {
      type: 'error',
      error: 'OpenRouter API key not set. Open Settings → AI and paste your key.',
    }
    return
  }

  const model = request.config?.openRouterModel?.trim() || DEFAULT_OPENROUTER_MODEL

  let response: Response
  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://bloomcode.app',
        'X-Title': 'BloomCode IDE',
      },
      body: JSON.stringify({
        model,
        messages: toApiMessages(request.messages, request.context),
        stream: true,
      }),
      signal: request.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      yield { type: 'error', error: 'Generation stopped.' }
      return
    }

    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Network error contacting OpenRouter.',
    }
    return
  }

  if (!response.ok) {
    const body = await response.text()
    yield { type: 'error', error: parseErrorMessage(response.status, body) }
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    yield { type: 'error', error: 'OpenRouter returned an empty response.' }
    return
  }

  yield* readSseStream(reader, request.signal)
}
