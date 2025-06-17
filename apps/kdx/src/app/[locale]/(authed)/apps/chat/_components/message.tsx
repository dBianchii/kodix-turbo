"use client";

import { FC, memo, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@kdx/ui";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  className?: string;
}

// Hook para copiar para clipboard
const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

// Componente de markdown otimizado
const MarkdownText = memo(({ content }: { content: string }) => {
  // ✅ DEBUG: Log para verificar o conteúdo
  console.log("🔍 [MarkdownText] Renderizando conteúdo:", {
    content,
    length: content.length,
    type: typeof content,
  });

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ className, ...props }) => (
          <h1
            className={cn("text-foreground mb-4 text-2xl font-bold", className)}
            {...props}
          />
        ),
        h2: ({ className, ...props }) => (
          <h2
            className={cn(
              "text-foreground mb-3 text-xl font-semibold",
              className,
            )}
            {...props}
          />
        ),
        h3: ({ className, ...props }) => (
          <h3
            className={cn(
              "text-foreground mb-3 text-lg font-semibold",
              className,
            )}
            {...props}
          />
        ),
        h4: ({ className, ...props }) => (
          <h4
            className={cn(
              "text-foreground mb-2 text-base font-semibold",
              className,
            )}
            {...props}
          />
        ),
        h5: ({ className, ...props }) => (
          <h5
            className={cn(
              "text-foreground mb-2 text-sm font-semibold",
              className,
            )}
            {...props}
          />
        ),
        h6: ({ className, ...props }) => (
          <h6
            className={cn(
              "text-foreground mb-2 text-xs font-semibold",
              className,
            )}
            {...props}
          />
        ),
        p: ({ className, ...props }) => (
          <p
            className={cn(
              "text-foreground mb-3 leading-relaxed last:mb-0",
              className,
            )}
            {...props}
          />
        ),
        a: ({ className, ...props }) => (
          <a
            className={cn(
              "text-primary underline-offset-4 hover:underline",
              className,
            )}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={cn(
              "border-muted-foreground/50 text-muted-foreground border-l-4 pl-4 italic",
              className,
            )}
            {...props}
          />
        ),
        ul: ({ className, ...props }) => (
          <ul
            className={cn("text-foreground mb-3 ml-6 list-disc", className)}
            {...props}
          />
        ),
        ol: ({ className, ...props }) => (
          <ol
            className={cn("text-foreground mb-3 ml-6 list-decimal", className)}
            {...props}
          />
        ),
        li: ({ className, ...props }) => (
          <li
            className={cn("text-foreground leading-relaxed", className)}
            {...props}
          />
        ),
        hr: ({ className, ...props }) => (
          <hr className={cn("border-muted my-4", className)} {...props} />
        ),
        table: ({ className, ...props }) => (
          <table
            className={cn(
              "border-muted mb-4 w-full border-collapse border",
              className,
            )}
            {...props}
          />
        ),
        th: ({ className, ...props }) => (
          <th
            className={cn(
              "border-muted bg-muted/50 text-foreground border px-4 py-2 text-left font-semibold",
              className,
            )}
            {...props}
          />
        ),
        td: ({ className, ...props }) => (
          <td
            className={cn(
              "border-muted text-foreground border px-4 py-2",
              className,
            )}
            {...props}
          />
        ),
        tr: ({ className, ...props }) => (
          <tr className={cn("border-muted border-b", className)} {...props} />
        ),
        sup: ({ className, ...props }) => (
          <sup
            className={cn("text-foreground text-xs", className)}
            {...props}
          />
        ),
        pre: ({ className, ...props }) => (
          <pre
            className={cn(
              "bg-muted/50 text-foreground mb-4 overflow-x-auto rounded-lg border p-4",
              className,
            )}
            {...props}
          />
        ),
        code: ({ className, inline, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className={cn(
                  "bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm",
                  className,
                )}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className={cn("text-foreground font-mono text-sm", className)}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownText.displayName = "MarkdownText";

export function Message({
  role,
  content,
  isStreaming,
  className,
}: MessageProps) {
  // ✅ DEBUG: Log para verificar props
  console.log("🔍 [Message] Renderizando mensagem:", {
    role,
    content: content.substring(0, 100) + "...",
    contentLength: content.length,
    isStreaming,
  });

  return (
    <div
      className={cn(
        "group relative mb-6 flex w-full",
        role === "user" ? "justify-end" : "justify-start",
        className,
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-lg px-4 py-3",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 text-foreground",
        )}
      >
        {role === "assistant" ? (
          <div className="prose prose-sm max-w-none">
            <MarkdownText content={content} />
          </div>
        ) : (
          <div className="text-foreground whitespace-pre-wrap">{content}</div>
        )}
      </div>
    </div>
  );
}
