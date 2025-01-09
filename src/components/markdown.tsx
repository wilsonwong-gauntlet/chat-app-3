"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn("prose dark:prose-invert prose-sm max-w-none", className)}
      components={{
        // Override default element styling
        p: ({ children }) => <p className="leading-7">{children}</p>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="my-2 ml-6 list-disc [&>li]:mt-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 ml-6 list-decimal [&>li]:mt-1">{children}</ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-2 mt-2 overflow-x-auto rounded-lg bg-muted p-4">
            {children}
          </pre>
        ),
        h1: ({ children }) => (
          <h1 className="mb-2 mt-6 text-2xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-6 text-xl font-semibold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-6 text-lg font-semibold">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="mb-2 mt-6 text-base font-semibold">{children}</h4>
        ),
        hr: () => <hr className="my-4 border-muted" />,
        table: ({ children }) => (
          <div className="my-4 w-full overflow-y-auto">
            <table className="w-full">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
} 