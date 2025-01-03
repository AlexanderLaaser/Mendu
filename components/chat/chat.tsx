// components/Chat/ChatView.tsx
"use client";

import React from "react";
import MessageList from "./messageList";
import MessageInput from "./messageInput";

interface ChatProps {
  activeChatId: string | null; // Aktuell ausgewählter Chat oder null
}

const Chat: React.FC<ChatProps> = ({ activeChatId }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Nachrichtenliste */}
      <MessageList chatId={activeChatId} />
      {/* Eingabefeld am unteren Rand */}
      <MessageInput chatId={activeChatId} />
    </div>
  );
};

export default Chat;
