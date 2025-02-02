"use client";

import React, { useMemo, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { useUserDataContext } from "@/context/UserDataContext";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useChatsContext } from "@/context/ChatsContext";
import type { Chat, Message } from "@/models/chat";

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
}

const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const { userData } = useUserDataContext();
  const { chats, loadingChats } = useChatsContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean Code: Finde den aktiven Chat basierend auf der chatId aus dem Chats-Array
  const activeChat = useMemo(() => {
    return chats?.find((chat: Chat) => chat.id === chatId) || null;
  }, [chats, chatId]);
  console.log("activeChat", activeChat);

  // Loading- und Fehlerfälle prüfen
  if (!chatId) {
    return <div className="p-4 text-gray-500">Wähle einen Chat aus.</div>;
  }
  if (loadingChats) {
    return <div className="p-4 text-gray-500">Lade Chats...</div>;
  }

  // Falls kein aktiver Chat gefunden wird, entsprechende Nachricht anzeigen
  if (!activeChat) {
    return <div className="p-4 text-gray-500">Kein aktiver Chat gefunden.</div>;
  }

  // Clean Code: Extrahiere die Nachrichten des aktiven Chats (Fallback: leeres Array)
  const messages: Message[] = activeChat.messages || [];

  // Formatierungsfunktionen für Datum und Uhrzeit
  const formatDateSeparator = (date: Date) => format(date, "dd.MM.yyyy");
  const formatMessageTime = (date: Date) => format(date, "HH:mm");

  return (
    <div
      className="flex flex-col p-4 max-h-[700px] overflow-y-auto"
      key={chatId}
    >
      {messages.map((message, index) => {
        if (!message.createdAt) return null; // Sicherstellen, dass createdAt vorhanden ist

        const currentDate = message.createdAt.toDate(); // Clean Code: Umwandlung des Timestamps in ein Date-Objekt
        const previousMessage = messages[index - 1];
        const previousDate = previousMessage?.createdAt?.toDate();

        // Bestimme, ob ein Datums-Trenner (Separator) angezeigt werden soll
        let showDateSeparator = false;
        if (index === 0) {
          showDateSeparator = true;
        } else if (previousDate && !isSameDay(currentDate, previousDate)) {
          showDateSeparator = true;
        }

        // Überprüfe, ob die Nachricht vom aktuellen User stammt
        const isCurrentUser = message.senderId === userData?.uid;

        // Hinweis: sendersData ist hier nicht definiert – falls benötigt, entsprechende Daten importieren oder entfernen
        const senderData = !isCurrentUser ? {} : undefined;

        // Aufbau des Sendernamens
        const senderName = isCurrentUser
          ? `${userData?.personalData?.firstName ?? ""} ${
              userData?.personalData?.lastName ?? ""
            }`.trim() || "You"
          : senderData && (senderData as any).personalData // Falls zusätzliche Senderdaten vorhanden sind, diese verwenden
          ? `${(senderData as any).personalData.firstName ?? ""} ${
              (senderData as any).personalData.lastName ?? ""
            }`.trim()
          : "Mendu";

        // Nachrichteninhalt und Zeitformatierung
        const content = [message.text];
        const time = formatMessageTime(currentDate);

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && (
              <div className="text-xs text-center py-2 mb-4">
                {formatDateSeparator(currentDate)}
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <Avatar className="h-10 w-10">
                <AvatarImage alt={senderName} />
                <AvatarFallback>{senderName[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-sm">{senderName}</span>
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
      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(MessageList);
