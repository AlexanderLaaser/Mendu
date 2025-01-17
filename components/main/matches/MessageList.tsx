"use client";

import React, { useEffect, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { format, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUserData from "@/hooks/useUserData";
import { User } from "@/models/user";
import { useUsersData } from "@/hooks/useUsersData";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useMarkMessagesAsRead } from "@/hooks/useMarkMessagesAsRead";
import type { Components } from "react-markdown";

// Define properly typed custom components for ReactMarkdown
const MarkdownComponents: Components = {
  // The paragraph component receives all HTML attributes for a p tag
  p: ({ node, children, ...props }) => {
    return (
      <div className="text-sm text-black" {...props}>
        {children}
      </div>
    );
  },
  // The anchor component receives all HTML attributes for an a tag
  a: ({ node, children, href, ...props }) => {
    return (
      <a
        href={href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
};

interface MessageListProps {
  chatId: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const { userData } = useUserData();
  const messages = useMessages(
    chatId,
    userData?.uid ? (userData as User) : null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const distinctSenderIds = Array.from(
    new Set(
      messages
        .filter((msg) => msg.senderId && msg.senderId !== userData?.uid)
        .map((msg) => msg.senderId)
    )
  );

  const sendersData = useUsersData(distinctSenderIds);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useMarkMessagesAsRead(chatId, messages);

  if (!chatId) {
    return <div className="p-4 text-gray-500">Wähle einen Chat aus.</div>;
  }

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

        const avatarUrl = isCurrentUser
          ? userData?.photoURL ?? "https://via.placeholder.com/40"
          : senderData?.photoURL ?? "https://via.placeholder.com/40";

        const content = [msg.text];
        const time = formatMessageTime(currentDate);

        return (
          <React.Fragment key={msg.messageId}>
            {showDateSeparator && (
              <div className="text-xs text-center py-2 mb-4">
                {formatDateSeparator(currentDate)}
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} alt={senderName} />
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

export default MessageList;
