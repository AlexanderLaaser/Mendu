// components/Chat/useMessages.ts
"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Message } from "@/models/chat";

export function useMessages(chatId: string | null): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        loadedMessages.push({
          messageId: doc.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt?.toDate() ?? new Date(),
          attachments: data.attachments || [],
          readBy: data.readBy || [],
        });
      });
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  return messages;
}
