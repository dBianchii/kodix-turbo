"use client";

interface MessageProps {
  role: "assistant" | "user" | "agent";
  content: string;
}

export function Message({ role, content }: MessageProps) {
  return (
    <div
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          role === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
