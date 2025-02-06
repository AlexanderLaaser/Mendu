"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  Timestamp, // Clean Code: Import von Timestamp für Typkonvertierung
} from "firebase/firestore";
import type { Message, MessageSummary } from "@/models/chat";

export interface MessagePayload {
  chatId: string;
  text: string;
  partnerId: string;
}

export const useSendMessage = () => {
  const { user } = useAuth();

  const sendMessage = async ({ chatId, text, partnerId }: MessagePayload) => {
    if (!user || !chatId || text.trim() === "") return;

    try {
      const chatDocRef = doc(db, "chats", chatId);

      // Clean Code: Erstelle das neue Message-Objekt gemäß dem neuen Modell mit Typensicherheit.
      const newMessage: Message = {
        senderId: user.uid,
        text: text.trim(),
        createdAt: Timestamp.now(), // Konvertiere das aktuelle Datum in einen Firestore Timestamp
        readBy: [],
        type: "TEXT",
        recipientUid: [partnerId], // Speichere die Partner-ID als Array (gemäß Model)
      };

      await updateDoc(chatDocRef, {
        messages: arrayUnion(newMessage), // Hinzufügen der neuen Nachricht zum Array-Feld "messages"
        lastMessage: {
          text: text.trim(),
          senderId: user.uid,
          createdAt: Timestamp.now(), // Verwende serverTimestamp() für lastMessage
        } as MessageSummary, // Sicherstellen, dass lastMessage dem MessageSummary Interface entspricht
      });
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
      throw error;
    }
  };

  return { sendMessage };
};
