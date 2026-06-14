import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../lib/ai'
import { ChatMessageBubble } from './ChatMessageBubble'

type ChatMessageListProps = {
  messages: ChatMessage[]
  isStreaming: boolean
}

export function ChatMessageList({ messages, isStreaming }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' })
  }, [messages, isStreaming])

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
