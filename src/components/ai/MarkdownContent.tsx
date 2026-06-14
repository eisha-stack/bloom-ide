import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { CodeBlock } from './CodeBlock'

type MarkdownContentProps = {
  content: string
  isStreaming?: boolean
}

const components: Components = {
  pre({ children }) {
    return <>{children}</>
  },
  code({ className, children, ...props }) {
    const text = String(children).replace(/\n$/, '')
    const match = /language-(\w+)/.exec(className ?? '')
    const isInline = !match && !text.includes('\n')

    if (isInline) {
      return (
        <code
          className="ai-inline-code rounded px-1 py-0.5 font-[family-name:var(--font-mono)] text-[11px]"
          {...props}
        >
          {children}
        </code>
      )
    }

    return <CodeBlock code={text} language={match?.[1]} />
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-[var(--bloom-lilac)] underline decoration-[rgba(168,85,247,0.35)] underline-offset-2 hover:text-[var(--accent-primary)]"
      >
        {children}
      </a>
    )
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-2 border-l-2 border-[var(--bloom-lavender)] pl-3 text-[var(--text-secondary)]">
        {children}
      </blockquote>
    )
  },
  ul({ children }) {
    return <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  },
  ol({ children }) {
    return <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
  },
  h1({ children }) {
    return <h1 className="mb-2 mt-3 text-[14px] font-semibold text-[var(--text-primary)]">{children}</h1>
  },
  h2({ children }) {
    return <h2 className="mb-2 mt-3 text-[13px] font-semibold text-[var(--text-primary)]">{children}</h2>
  },
  h3({ children }) {
    return <h3 className="mb-1 mt-2 text-[12px] font-semibold text-[var(--text-primary)]">{children}</h3>
  },
  p({ children }) {
    return <p className="my-1.5 leading-relaxed">{children}</p>
  },
  table({ children }) {
    return (
      <div className="my-2 overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">{children}</table>
      </div>
    )
  },
  th({ children }) {
    return (
      <th className="border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2 py-1 text-left font-semibold">
        {children}
      </th>
    )
  },
  td({ children }) {
    return <td className="border border-[var(--border-subtle)] px-2 py-1">{children}</td>
  },
}

export function MarkdownContent({ content, isStreaming }: MarkdownContentProps) {
  return (
    <div className="ai-markdown text-[12px] text-[var(--text-secondary)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span
          className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-[var(--accent-primary)]"
          aria-hidden
        />
      )}
    </div>
  )
}
