"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ChatWindow } from "./_components/chat-window";

export default function AgentPage() {
  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-[#121212]">
      <ChatWindow />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
