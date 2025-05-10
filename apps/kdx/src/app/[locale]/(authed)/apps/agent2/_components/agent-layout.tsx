"use client";

import { useState } from "react";
import { LuPencil } from "react-icons/lu";

import { ChevronLeftIcon, ChevronRightIcon } from "./agent-icons";
import { ChatWindow } from "./chat-window";

export default function AgentLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const conversations = ["Conversa 1", "Conversa 2", "Conversa 3"];

  return <ChatWindow />;
}
