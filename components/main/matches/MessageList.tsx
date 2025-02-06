"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUserDataContext } from "@/context/UserDataContext";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useChatsContext } from "@/context/ChatsContext";
import type { Chat, Message } from "@/models/chat";
import { User } from "@/models/user";

// Markdown-Komponenten-Konfiguration
const MarkdownComponents: Components = {
  p: ({ children, ...props }) => (
    <div className="text-sm text-black" {...props}>
      {children}
    </div>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

interface MessageListProps {
  chatId: string | null;
  partnerData: User;
}

const MessageList: React.FC<MessageListProps> = ({ chatId, partnerData }) => {
  const { userData } = useUserDataContext();
  const { chats, loadingChats } = useChatsContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Finde den aktiven Chat anhand der chatId aus dem Chats-Array
  const activeChat = useMemo(() => {
    return chats?.find((chat: Chat) => chat.id === chatId) || null;
  }, [chats, chatId]);
  console.log("activeChat", activeChat);

  // Filtere nur Nachrichten, bei denen der aktuell angemeldete User als Sender oder Empfänger steht
  const messages: Message[] = useMemo(() => {
    if (!activeChat || !userData?.uid) return [];
    return activeChat.messages.filter(
      (msg) =>
        msg.senderId === userData.uid ||
        msg.recipientUid?.includes(userData.uid)
    );
  }, [activeChat, userData?.uid]);

  // Scrollt automatisch zur letzten Nachricht, wenn sich das Nachrichtenarray ändert
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Loading- und Fehlerfälle prüfen
  if (!chatId) {
    return <div className="p-4 text-gray-500">Wähle einen Chat aus.</div>;
  }
  if (loadingChats) {
    return <div className="p-4 text-gray-500">Lade Chats...</div>;
  }
  if (!activeChat) {
    return <div className="p-4 text-gray-500">Kein aktiver Chat gefunden.</div>;
  }

  const formatDateSeparator = (date: Date) => format(date, "dd.MM.yyyy");
  const formatMessageTime = (date: Date) => format(date, "HH:mm");

  return (
    <div className="flex flex-col p-4 max-h-[700px] overflow-y-auto">
      {messages.map((message, index) => {
        if (!message.createdAt) return null; // Sicherstellen, dass createdAt vorhanden ist

        const currentDate = message.createdAt.toDate(); // Umwandlung des Timestamps in ein Date-Objekt
        const previousMessage = messages[index - 1];
        const previousDate = previousMessage?.createdAt?.toDate();

        let showDateSeparator = false;
        if (index === 0) {
          showDateSeparator = true;
        } else if (previousDate && !isSameDay(currentDate, previousDate)) {
          showDateSeparator = true;
        }

        let senderName: string;
        if (message.senderId === userData?.uid) {
          senderName = "You";
        } else if (message.senderId === "SYSTEM") {
          senderName = "Mendu";
        } else {
          senderName = partnerData.personalData?.firstName || "Partner";
        }

        const content = [message.text];
        const time = formatMessageTime(currentDate);

        return (
          // Verwende message.id oder, falls nicht vorhanden, den Index als Fallback
          <React.Fragment key={message.id ?? index}>
            {showDateSeparator && (
              <div className="text-xs text-center py-2 mb-4">
                {formatDateSeparator(currentDate)}
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <Avatar className="h-10 w-10">
                <AvatarImage alt={senderName} />
                <AvatarFallback>{senderName[0].toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-bold text-sm ${
                      senderName === "Mendu" ? "text-primary" : ""
                    }`} // Anpassung: Setze primary font style für Mendu
                  >
                    {senderName}
                  </span>
                  <span className="text-xs text-zinc-500">{time}</span>
                </div>

                <div className="space-y-2">
                  {content.map((text, idx) => {
                    // Prüfe, ob ein Google Meet-Link im Text enthalten ist
                    const meetRegex =
                      /\((https:\/\/meet\.google\.com[^\s)]*)\)/;
                    const match = text.match(meetRegex);
                    const meetLink = match ? match[1] : null;

                    return (
                      <div key={idx} className="message-content">
                        <ReactMarkdown
                          components={MarkdownComponents}
                          className="text-sm text-black"
                        >
                          {text}
                        </ReactMarkdown>
                        {meetLink && (
                          <Button
                            variant="secondary"
                            className="mt-2 p-4"
                            onClick={() => window.open(meetLink, "_blank")}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      {/* Unsichtbarer Div am Ende, an den gescrollt wird */}
      <div key="messagesEnd" ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(MessageList);
