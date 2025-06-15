"use client";

import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@kdx/ui";
import { Avatar, AvatarFallback } from "@kdx/ui/avatar";

interface MessageRendererV3Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export function MessageRendererV3({
  role,
  content,
  isStreaming = false,
  className,
}: MessageRendererV3Props) {
  return (
    <div
      className={cn(
        "group relative flex gap-4 px-4 py-6 text-base md:px-6 lg:px-8",
        role === "user" ? "bg-background" : "bg-muted/30",
        className,
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className={cn(
              "text-xs font-medium",
              role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground text-background",
            )}
          >
            {role === "user" ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Role Label */}
        <div className="text-foreground text-sm font-medium">
          {role === "user" ? "You" : "Assistant"}
        </div>

        {/* Message Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {content ? (
            role === "assistant" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Customizar componentes para seguir o design do assistant-ui
                  p: ({ children }) => (
                    <p className="text-foreground mb-4 leading-relaxed last:mb-0">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-foreground mb-4 text-xl font-semibold">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-foreground mb-3 text-lg font-semibold">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-foreground mb-2 text-base font-semibold">
                      {children}
                    </h3>
                  ),
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !match ? (
                      <code
                        className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted mb-4 overflow-x-auto rounded-lg p-4 text-sm">
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-foreground mb-4 ml-4 list-disc space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-foreground mb-4 ml-4 list-decimal space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-muted-foreground text-muted-foreground mb-4 border-l-4 pl-4 italic">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-foreground font-semibold">
                      {children}
                    </strong>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            )
          ) : isStreaming ? (
            <div className="text-muted-foreground flex items-center space-x-1">
              <div className="animate-pulse">●</div>
              <div className="animate-pulse delay-100">●</div>
              <div className="animate-pulse delay-200">●</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
