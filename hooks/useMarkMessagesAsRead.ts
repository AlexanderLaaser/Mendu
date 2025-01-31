// hooks/useMarkMessagesAsRead.ts
"use client";

import { useEffect } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase";
import { Message } from "@/models/chat"; // Passen Sie den Pfad an, falls nötig
import { useUserDataContext } from "@/context/UserDataProvider";

export function useMarkMessagesAsRead(chatId: string | null, messages: Message[]) {
  const { userData } = useUserDataContext();

  useEffect(() => {
    async function markMessagesAsRead() {
      if (!userData?.uid || !chatId) return;
  
      const unreadMessages = messages.filter(
        (msg) =>
          !msg.readBy ||
          (userData.uid && !msg.readBy.includes(userData.uid))
      );
  
      const updatePromises = unreadMessages.map(async (msg) => {
        const messageRef = doc(db, "chats", chatId, "messages", msg.id);
        try {
          await updateDoc(messageRef, {
            readBy: arrayUnion(userData.uid),
          });
        } catch (error) {
          console.error("Fehler beim Aktualisieren von readBy:", msg.id, error);
        }
      });
  
      await Promise.all(updatePromises);
    }
  
    markMessagesAsRead();
    // INLINE KOMMENTAR: Nur auf wirklich notwendige Werte lauschen!
  }, [messages, userData?.uid, chatId]); // <-- userData statt userData?uid ersetzen
  
}
