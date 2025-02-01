"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { useUserDataContext } from "@/context/UserDataContext";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useUsersData } from "@/hooks/useUsersData";
import { useChatsContext } from "@/context/ChatsContext";
import { Message } from "@/models/chat"; // ggf. anpassen, wo dein `Message`-Typ liegt

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

  /* CODE CHANGE: Wir holen jetzt explizit chats und loadingChats aus dem Context. */
  const { chats, loadingChats } = useChatsContext(); // <-- statt "const messages = useChatsContext();"

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* CODE CHANGE: Aus chats leiten wir nun die Nachrichten für das gegebene chatId ab. */
  const messages: Message[] = useMemo(() => {
    if (!chats || !chatId) return [];
    const currentChat = chats.find((chat) => chat.id === chatId);
    return currentChat?.messages || [];
  }, [chats, chatId]);

  /* CODE CHANGE: Distinct Sender Ids ermitteln, falls nicht schon vorhanden. */
  const distinctSenderIds = useMemo(() => {
    return [...new Set(messages.map((m) => m.senderId))];
  }, [messages]);

  // Senderdaten anhand der eindeutigen IDs abrufen
  const sendersData = useUsersData(distinctSenderIds);

  // Markiere Nachrichten als gelesen
  useMarkMessagesAsRead(chatId, messages);

  // Automatisches Scrollen ans Ende, wenn sich Nachrichten ändern
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Loading- und Fehlerfälle
  if (!chatId) {
    return <div className="p-4 text-gray-500">Wähle einen Chat aus.</div>;
  }
  if (loadingChats) {
    return <div className="p-4 text-gray-500">Lade Chats...</div>;
  }

  // Formatierungsfunktionen
  const formatDateSeparator = (date: Date) => format(date, "dd.MM.yyyy");
  const formatMessageTime = (date: Date) => format(date, "HH:mm");

  return (
    <div className="flex flex-col p-4 max-h-[700px] overflow-y-auto">
      {messages.map((message, index) => {
        if (!message.createdAt) return null;

        const currentDate = message.createdAt.toDate();
        const previousMessage = messages[index - 1];
        const previousDate = previousMessage?.createdAt?.toDate();

        let showDateSeparator = false;
        if (index === 0) {
          showDateSeparator = true;
        } else if (previousDate && !isSameDay(currentDate, previousDate)) {
          showDateSeparator = true;
        }

        const isCurrentUser = message.senderId === userData?.uid;
        const senderData = !isCurrentUser
          ? sendersData[message.senderId]
          : undefined;

        // Aufbau des Sendernamens
        const senderName = isCurrentUser
          ? `${userData?.personalData?.firstName ?? ""} ${
              userData?.personalData?.lastName ?? ""
            }`.trim() || "You"
          : senderData
          ? `${senderData.personalData?.firstName ?? ""} ${
              senderData.personalData?.lastName ?? ""
            }`.trim()
          : "Mendu";

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
