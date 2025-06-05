"use client";

import React from "react";

interface MessageProps {
  role: "assistant" | "user";
  content: string;
}

export function Message({ role, content }: MessageProps) {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          role === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
        }`}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
