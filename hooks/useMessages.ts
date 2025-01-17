// components/Chat/useMessages.ts
"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Message } from "@/models/chat";
import { User } from "@/models/user"; 

export function useMessages(chatId: string | null, currentUser: User | null): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        return {
          messageId: doc.id,
          ...doc.data(),
        } as Message;
      });

      // Hier filtern wir alle System-Nachrichten heraus.
      // (Wenn du *manche* Systemnachrichten anzeigen willst,
      //  dann kannst du noch zusätzlich checken, ob der user
      //  der recipientUid ist. Siehe Kommentar unten.)
      const filtered = msgs.filter((m) => {
        if (m.type === "SYSTEM") {
          // Nur zeigen, wenn der aktuelle User Empfänger ist
          return m.recipientUid === currentUser?.uid;
        }
        return true; // TEXT, CALENDAR usw. werden immer gezeigt
      });

      setMessages(filtered);
    });

    return () => unsubscribe();
  }, [chatId, currentUser?.uid]);

  return messages;
}
