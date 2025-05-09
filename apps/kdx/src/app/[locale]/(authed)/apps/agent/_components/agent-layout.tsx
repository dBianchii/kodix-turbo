"use client";

import { useState } from "react";
import { LuPencil } from "react-icons/lu";

import { ChevronLeftIcon, ChevronRightIcon } from "./agent-icons";
import { ChatWindow } from "./chat-window";

export default function AgentLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const conversations = ["Conversa 1", "Conversa 2", "Conversa 3"];

  return (
    <div className="flex h-full overflow-hidden bg-[#121212] text-white">
      <aside
        className={`flex h-full flex-col bg-[#1e1e1e] transition-all duration-300 ${
          isOpen ? "w-1/4" : "w-24"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          {isOpen && <span className="font-bold">Conversas</span>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded p-1 hover:bg-gray-600"
          >
            {isOpen ? (
              <ChevronLeftIcon className="h-5 w-5 text-gray-300" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
          <button className="flex h-10 w-10 min-w-[20px] items-center justify-center rounded p-2 hover:bg-gray-600">
            <LuPencil className="h-5 w-5 text-gray-300" />
          </button>
        </div>
        <ul className="flex-1 divide-y divide-gray-700 overflow-y-auto">
          {conversations.map((conv, idx) => (
            <li
              key={idx}
              className={`cursor-pointer overflow-hidden p-2 overflow-ellipsis whitespace-nowrap hover:bg-gray-700 ${
                isOpen ? "" : "hidden"
              }`}
            >
              {conv}
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
