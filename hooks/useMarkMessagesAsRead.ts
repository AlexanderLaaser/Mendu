// hooks/useMarkMessagesAsRead.ts
"use client";

import { useEffect } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase";
import { Message } from "@/models/chat"; // Passen Sie den Pfad an, falls nötig
import useUserData from "@/hooks/useUserData";

export function useMarkMessagesAsRead(chatId: string | null, messages: Message[]) {
  const { userData } = useUserData();

  useEffect(() => {
    async function markMessagesAsRead() {
      if (!userData?.uid || !chatId) return;

      // Filtere Nachrichten, die der aktuelle Benutzer noch nicht gelesen hat
      const unreadMessages = messages.filter(
        (msg) => !msg.readBy || (userData.uid && !msg.readBy.includes(userData.uid))
      );

      // Aktualisiere jede ungelesene Nachricht: füge userData.uid in readBy ein
      const updatePromises = unreadMessages.map(async (msg) => {
        const messageRef = doc(db, "chats", chatId, "messages", msg.messageId);
        try {
          await updateDoc(messageRef, {
            readBy: arrayUnion(userData.uid),
          });
        } catch (error) {
          console.error("Fehler beim Aktualisieren von readBy für Nachricht:", msg.messageId, error);
        }
      });

      await Promise.all(updatePromises);
    }

    markMessagesAsRead();
  }, [messages, userData, chatId]);
}
