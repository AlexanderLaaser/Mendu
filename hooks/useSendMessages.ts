// hooks/useSendMessage.ts
"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";

export interface MessagePayload {
  chatId: string;
  text: string;
}

/**
 * Custom Hook, der die Logik zum Senden einer Nachricht kapselt.
 */
export const useSendMessage = () => {
  const { user } = useAuth();

  /**
   * sendMessage fügt eine neue Nachricht zum Chat-Dokument hinzu
   * und aktualisiert gleichzeitig das Feld lastMessage.
   *
   * Hinweis: Wir können serverTimestamp() nicht innerhalb von arrayUnion() verwenden,
   * daher nutzen wir hier new Date() als Timestamp für die Nachricht im Array.
   */
  const sendMessage = async ({ chatId, text }: MessagePayload) => {
    if (!user || !chatId || text.trim() === "") return;

    try {
      const chatDocRef = doc(db, "chats", chatId);

      // Erstelle das neue Message-Objekt. 
      // Verwende new Date() statt serverTimestamp(), da serverTimestamp() in arrayUnion() nicht zulässig ist.
      const newMessage = {
        senderId: user.uid,
        text: text.trim(),
        createdAt: new Date(), // Clientseitiger Timestamp
        readBy: [],
        type: "TEXT",
      };

      // Aktualisiere das Chat-Dokument:
      // - Füge newMessage dem messages Array hinzu.
      // - Setze lastMessage auf den neuen Nachrichteninhalt mit serverTimestamp() (als Top-Level-Feld).
      await updateDoc(chatDocRef, {
        messages: arrayUnion(newMessage),
        lastMessage: {
          text: text.trim(),
          senderId: user.uid,
          createdAt: serverTimestamp(),
        },
      });
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
      throw error;
    }
  };

  return { sendMessage };
};
