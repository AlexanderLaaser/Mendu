"use client";

import React from "react";
import { Chat } from "@/models/chat";
import { format } from "date-fns"; // Oder ein anderes Datumsformat-Paket, falls du magst
import useUserData from "@/hooks/useUserData";
import { Badge } from "@/components/ui/badge";
// changed: import Timestamp (nicht nur für Type, sondern zur Laufzeitprüfung)
import { Timestamp } from "firebase/firestore"; // changed

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string; // Neue Prop für den ausgewählten Chat
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatSelect,
  selectedChatId,
}) => {
  const { userData } = useUserData();

  const getMatchPercentage = () => {
    // Beispiel: 65%
    return 0;
  };

  // Formatierung der Erstellungszeit
  // changed: Hier behandeln wir sowohl Firestore Timestamps als auch Plain Objects
  const getCreatedTime = (timestamp: any): string => {
    // changed
    let dateObj: Date; // changed

    if (timestamp instanceof Timestamp) {
      // changed
      // Falls es tatsächlich ein Firestore Timestamp ist
      dateObj = timestamp.toDate(); // changed
    } else if (timestamp?.seconds && timestamp?.nanoseconds) {
      // changed
      // Falls es ein Plain-Object mit seconds und nanoseconds ist
      dateObj = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      ); // changed
    } else {
      // changed
      return ""; // changed
    } // changed

    return format(dateObj, "dd-MM-yyyy HH:mm"); // Nur Stunden:Minuten z.B. 14:05
  };

  return (
    <div className="h-full overflow-y-auto text-sm">
      <ul>
        {chats.map((chat) => {
          const matchPercentage = getMatchPercentage();
          const partnerLastName = userData?.personalData?.firstName || "";
          const createdTime = chat.createdAt
            ? getCreatedTime(chat.createdAt)
            : "";

          // Prüfen, ob der aktuelle Chat ausgewählt ist
          const isSelected = chat.id === selectedChatId;

          return (
            <li
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`relative cursor-pointer hover:bg-gray-100 hover:rounded-lg p-4 mr-4 mb-4 border-b last:border-b-0 border-gray-200 ${
                isSelected ? "bg-primary/10 rounded-lg" : ""
              }`}
            >
              {/* Grüne Prozent-Anzeige oben rechts */}
              <span className="absolute top-2 right-2 bg-green-100 text-green-600 text-xs px-1 py-0.5 rounded">
                {matchPercentage}%
              </span>

              {/* Firmenname */}
              <div className="font-semibold">
                {chat.insiderCompany || "Unbekannt"}
              </div>

              <Badge>{chat.type || "Unbekannt"}</Badge>

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
