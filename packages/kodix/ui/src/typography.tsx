"use client";

import type { ComponentProps } from "react";
import { cn } from ".";

export function H1({ children, className }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "scroll-m-20 font-semibold text-2xl tracking-tight",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function H4({ children, className }: ComponentProps<"h4">) {
  return (
    <h4
      className={cn(
        "scroll-m-20 font-semibold text-xl tracking-tight",
        className,
      )}
    >
      {children}
    </h4>
  );
}

export function P({ children, className }: ComponentProps<"p">) {
  return (
    <p className={cn("not-first:mt-6 leading-7", className)}>{children}</p>
  );
}

export function Blockquote({
  children,
  className,
}: ComponentProps<"blockquote">) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
      {children}
    </blockquote>
  );
}

export function UL({ children, className }: ComponentProps<"ul">) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}>
      {children}
    </ul>
  );
}

export function Lead({ children, className }: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-xl", className)}>{children}</p>
  );
}

export function Large({ children, className }: ComponentProps<"div">) {
  return (
    <div className={cn("font-semibold text-lg", className)}>{children}</div>
  );
}

export function Small({ children, className }: ComponentProps<"small">) {
  return (
    <small className={cn("font-medium text-sm leading-none", className)}>
      {children}
    </small>
  );
}

export function Muted({ children, className }: ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)}>{children}</p>
  );
}
