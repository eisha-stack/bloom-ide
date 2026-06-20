import type { AIProvider, AIProviderId } from '../types'
import { mockProvider } from './mockProvider'
import { openrouterProvider } from './openrouterProvider'

const providers: Record<AIProviderId, AIProvider | undefined> = {
  mock: mockProvider,
  openrouter: openrouterProvider,
  openai: undefined,
  anthropic: undefined,
  cursor: undefined,
}

export function getAIProvider(id: AIProviderId): AIProvider {
  const provider = providers[id]
  if (!provider) {
    throw new Error(`AI provider "${id}" is not configured yet.`)
  }
  return provider
}

export function listAvailableProviders(): AIProvider[] {
  return Object.values(providers).filter((p): p is AIProvider => p !== undefined)
}

export { mockProvider, openrouterProvider }
