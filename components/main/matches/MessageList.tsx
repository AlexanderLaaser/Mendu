"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUsersData } from "@/hooks/useUsersData";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import { useUserDataContext } from "@/context/UserDataProvider";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

// Inline Kommentar: Hier importieren wir jetzt den gefilterten Hook.
import { useMessages } from "@/hooks/useMessages"; // <-- NEU (Wichtig)

const MarkdownComponents: Components = {
  p: ({ node, children, ...props }) => (
    <div className="text-sm text-black" {...props}>
      {children}
    </div>
  ),
  a: ({ node, children, href, ...props }) => (
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

  // Inline Kommentar: Jetzt nutzen wir nicht mehr unseren eigenen onSnapshot,
  // sondern den gefilterten Hook:
  const messages = useMessages(chatId, userData);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Da wir nun den Hook nutzen, fällt die gesamte onSnapshot-Logik weg
  // und wir haben die System-Filterung automatisch an einer Stelle zentralisiert.

  // Scroll bei Aktualisierung automatisch ans Ende
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Nachrichten als gelesen markieren
  useMarkMessagesAsRead(chatId, messages);

  // Falls kein Chat gewählt ist:
  if (!chatId) {
    return <div className="p-4 text-gray-500">Wähle einen Chat aus.</div>;
  }

  // Bestimme distinct sender IDs (außer aktuellen User)
  const distinctSenderIds = useMemo(() => {
    return Array.from(
      new Set(
        messages
          .filter((msg) => msg.senderId && msg.senderId !== userData?.uid)
          .map((msg) => msg.senderId)
      )
    );
  }, [messages, userData?.uid]);

  // Hole Senderdaten zu den IDs
  const sendersData = useUsersData(distinctSenderIds);

  // Formatierfunktionen
  const formatDateSeparator = (date: Date) => format(date, "dd.MM.yyyy");
  const formatMessageTime = (date: Date) => format(date, "HH:mm");

  return (
    <div className="flex flex-col p-4 max-h-[700px] overflow-y-auto">
      {messages.map((msg, index) => {
        if (!msg.createdAt) return null;

        const currentDate = msg.createdAt.toDate();
        const previousMessage = messages[index - 1];
        const previousDate = previousMessage?.createdAt?.toDate();

        let showDateSeparator = false;
        if (index === 0) {
          showDateSeparator = true;
        } else if (previousDate && !isSameDay(currentDate, previousDate)) {
          showDateSeparator = true;
        }

        const isCurrentUser = msg.senderId === userData?.uid;
        const senderData = !isCurrentUser
          ? sendersData[msg.senderId]
          : undefined;

        const senderName = isCurrentUser
          ? `${userData?.personalData?.firstName ?? ""} ${
              userData?.personalData?.lastName ?? ""
            }`.trim() || "You"
          : senderData
          ? `${senderData.personalData?.firstName ?? ""} ${
              senderData.personalData?.lastName ?? ""
            }`.trim()
          : "Mendu";

        const content = [msg.text];
        const time = formatMessageTime(currentDate);

        return (
          <React.Fragment key={msg.id}>
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
