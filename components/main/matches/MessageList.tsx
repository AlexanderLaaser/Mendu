"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageListProps {
  chatId: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const { user } = useAuth();
  const messages = useMessages(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatisch zum Ende scrollen, wenn neue Nachrichten eintreffen
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chatId) {
    return <div className="p-4 text-gray-500">Wähle einen Chat aus.</div>;
  }

  // Datum formatieren (z. B. 13.01.2025)
  const formatDateSeparator = (date: Date) => {
    return format(date, "dd.MM.yyyy");
  };

  // Uhrzeit formatieren (z. B. 15:47)
  const formatMessageTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  return (
    <div className="flex flex-col   p-4">
      {messages.map((msg, index) => {
        const currentDate = msg.createdAt;
        const previousMessage = messages[index - 1];
        const previousDate = previousMessage?.createdAt;

        // Herausfinden, ob ein neuer Datum-Separator angezeigt werden soll
        let showDateSeparator = false;
        if (index === 0) {
          showDateSeparator = true;
        } else if (previousDate && !isSameDay(currentDate, previousDate)) {
          showDateSeparator = true;
        }

        // Beispiel: Unterscheide zwischen dir und einem Chatpartner
        const isCurrentUser = msg.senderId === user?.uid;
        const senderName = isCurrentUser
          ? user.personalData?.lastName ?? "You"
          : "Mendu";
        const avatarUrl = isCurrentUser
          ? user?.photoURL ?? "https://via.placeholder.com/40"
          : "https://via.placeholder.com/40";

        // Single-Text-Nachricht in ein Array legen (falls du später Zeilenumbrüche verarbeiten willst)
        const content = [msg.text];
        const time = formatMessageTime(currentDate);

        return (
          <React.Fragment key={msg.messageId}>
            {/* Datumseparator, falls Tag gewechselt */}
            {showDateSeparator && (
              <div className="text-xs text-center py-2 mb-4">
                {formatDateSeparator(currentDate)}
              </div>
            )}

            {/* Nachricht-Container */}
            <div className="flex gap-3 mb-8">
              {/* Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={senderName} />
                <AvatarFallback>{senderName[0]}</AvatarFallback>
              </Avatar>

              {/* Nachrichtentext */}
              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-sm">{senderName}</span>
                  <span className="text-xs text-zinc-500">{time}</span>
                </div>

                <div className="space-y-2">
                  {content.map((text, idx) => (
                    <p key={idx} className="text-sm text-zinc-300">
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {/* Scroll-Hilfs-Element */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
