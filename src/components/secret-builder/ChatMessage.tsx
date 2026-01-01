import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  className?: string;
}

export function ChatMessage({ content, role, className }: ChatMessageProps) {
  if (role === 'user') {
    return <span className={className}>{content}</span>;
  }

  return (
    <div className={cn("chat-markdown prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          // Headings with proper hierarchy
          h1: ({ children }) => (
            <h3 className="text-base font-semibold text-foreground mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="text-sm font-semibold text-foreground mt-3 mb-1.5 first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="text-sm font-medium text-foreground mt-2 mb-1 first:mt-0">
              {children}
            </h5>
          ),
          // Paragraphs with good spacing
          p: ({ children }) => (
            <p className="text-sm text-foreground/90 leading-relaxed mb-2 last:mb-0">
              {children}
            </p>
          ),
          // Strong/bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          // Emphasis/italic
          em: ({ children }) => (
            <em className="italic text-foreground/80">{children}</em>
          ),
          // Unordered lists - clean bullet styling
          ul: ({ children }) => (
            <ul className="my-2 ml-1 space-y-1.5">{children}</ul>
          ),
          // Ordered lists
          ol: ({ children }) => (
            <ol className="my-2 ml-1 space-y-1.5 list-decimal list-inside">{children}</ol>
          ),
          // List items with custom bullet
          li: ({ children }) => (
            <li className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2">
              <span className="text-primary mt-1.5 text-xs">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          // Code blocks
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-foreground">
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("block p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto", className)} {...props}>
                {children}
              </code>
            );
          },
          // Pre blocks for code
          pre: ({ children }) => (
            <pre className="my-2 rounded-lg bg-muted p-3 overflow-x-auto text-xs">
              {children}
            </pre>
          ),
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-foreground/70 italic">
              {children}
            </blockquote>
          ),
          // Horizontal rules
          hr: () => <hr className="my-3 border-border/50" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
