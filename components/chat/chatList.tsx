"use client";

import React from "react";
import { Chat } from "@/models/chat";
import { format } from "date-fns"; // Oder ein anderes Datumsformat-Paket, falls du magst
import { useAuth } from "@/context/AuthContext";
import useUserData from "@/hooks/useUserData";

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onChatSelect }) => {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData, setUserData } = useUserData();

  const getMatchPercentage = (chat: Chat) => {
    // Beispiel: 65%
    return 0;
  };

  // Formatierung der Erstellungszeit
  const getCreatedTime = (date: Date) => {
    return format(date, "dd-MM-yyyy HH:mm"); // Nur Stunden:Minuten z.B. 14:05
  };

  return (
    <div className="h-full overflow-y-auto text-sm">
      <ul>
        {chats.map((chat) => {
          const matchPercentage = getMatchPercentage(chat);
          const partnerLastName = userData?.personalData?.lastName || "";
          const createdTime = chat.createdAt
            ? getCreatedTime(chat.createdAt)
            : "";

          return (
            <li
              key={chat.chatId}
              className="relative cursor-pointer hover:bg-gray-100 px-4 py-4 mr-4 border-b last:border-b-0 border-gray-200"
              onClick={() => onChatSelect(chat.chatId)}
            >
              {/* Grüne Prozent-Anzeige oben rechts */}
              <span className="absolute top-2 right-2 bg-green-100 text-green-600 text-xs px-1 py-0.5 rounded">
                {matchPercentage}%
              </span>

              {/* Firmenname */}
              <div className="font-semibold">
                {chat.insiderCompany || "Unbekannt"}
              </div>

              {/* Nachname in text-primary */}
              <div className="text-primary text-sm">{partnerLastName}</div>

              {/* Letzte Nachricht oder Placeholder */}
              {chat.lastMessage ? (
                <div className="text-sm text-gray-600">
                  {chat.lastMessage.text.substring(0, 30)}...
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  Noch keine Nachrichten
                </div>
              )}

              {/* Erstellungszeit unten rechts */}
              {createdTime && (
                <span className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {createdTime}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList;
