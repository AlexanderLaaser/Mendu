"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { format, isSameDay } from "date-fns"; // date-fns als Beispiel

interface MessageListProps {
  chatId: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const { user } = useAuth();
  const messages = useMessages(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatisch ans Ende scrollen, wenn neue Nachrichten kommen
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatId) {
    return <div className="p-4 text-gray-500">Wähle einen Chat aus.</div>;
  }

  // Hilfsfunktionen
  const formatMessageTime = (date: Date) => {
    return format(date, "HH:mm"); // z.B. "14:05"
  };

  const formatDateSeparator = (date: Date) => {
    // Du kannst hier logische Checks für "Heute", "Gestern" etc. einbauen.
    // Aktuell: "dd.MM.yyyy"
    return format(date, "dd.MM.yyyy");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 text-sm">
      {messages.map((msg, index) => {
        const currentDate = msg.createdAt;
        const previousMessage = messages[index - 1];
        const previousDate = previousMessage?.createdAt;

        // Check, ob wir einen Tages-Wechsel haben
        let showDateSeparator = false;
        if (index === 0) {
          // Erste Nachricht => Zeige auf jeden Fall Datum
          showDateSeparator = true;
        } else if (previousDate && !isSameDay(currentDate, previousDate)) {
          // Neuer Tag => Separator
          showDateSeparator = true;
        }

        return (
          <div key={msg.messageId}>
            {/* Datumseparator */}
            {showDateSeparator && (
              <div className="flex justify-center my-2">
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                  {formatDateSeparator(currentDate)}
                </span>
              </div>
            )}

            {/* Nachricht */}
            <div
              className={`mb-2 flex items-end ${
                msg.senderId === user?.uid ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg 
                  ${
                    msg.senderId === user?.uid
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black"
                  }
                `}
              >
                {msg.text}
                {/* Uhrzeit an der einzelnen Nachricht anzeigen */}
                <span className="ml-2 text-xs opacity-70 align-bottom">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
