import type { ReactNode } from "react";

interface ChatV3LayoutProps {
  children: ReactNode;
}

export default function ChatV3Layout({ children }: ChatV3LayoutProps) {
  return <div className="h-full">{children}</div>;
}
