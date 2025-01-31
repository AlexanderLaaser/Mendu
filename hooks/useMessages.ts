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

export function useMessages(chatId: string | null, currentUser: Partial<User> | null): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {

    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Message;
      });

      const filtered = msgs.filter((m) => {
        if (m.type === "SYSTEM") {
          // Nur zeigen, wenn der aktuelle User Empfänger ist
          return m.recipientUid === currentUser?.uid;
        }
        return true; // TEXT, CALENDAR usw. werden immer gezeigt
      });

      setMessages(filtered);
    });
    return () => {
      unsubscribe();
    }
    
  }, [chatId, currentUser]);

  return messages;
}
