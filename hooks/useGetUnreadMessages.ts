import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";

interface Message {
  messageId: string;
  senderId: string;
  text: string;
  createdAt: any; // Timestamp aus Firestore
  readBy?: string[];
  type: "SYSTEM" | "CALENDAR" | "TEXT";
}

export const useGetUnreadMessages = (userId?: string) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  // In diesem Ref speichern wir pro ChatId den Unsubscribe für das Message-Sub.
  // So vermeiden wir „Lost Subscriptions“ zwischen Re-Renders.
  const unsubscribesRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    // Ohne UserId macht Abhören keinen Sinn
    if (!userId) return;

    // 1. Chats für diesen User abfragen
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId)
    );

    // Haupt-Listener für alle Chats des Users
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      // Sammle die aktuellen Chat-IDs aus dem Snapshot
      const currentChatIds = new Set<string>();

      snapshot.docs.forEach((chatDoc) => {
        const chatId = chatDoc.id;
        currentChatIds.add(chatId);

        // Falls wir schon einen Listener für diesen Chat haben, nichts weiter tun
        if (unsubscribesRef.current.has(chatId)) return;

        // Wenn wir hier sind, haben wir noch KEINEN Listener für diesen Chat
        const messagesRef = collection(db, "chats", chatId, "messages");
        const unsubscribeMessages = onSnapshot(messagesRef, (messagesSnapshot) => {
          let chatUnreadCount = 0;

          messagesSnapshot.forEach((messageDoc) => {
            const message = messageDoc.data() as Message;

            const isUnread =
              // Nicht vom aktuellen User gesendet
              message.senderId !== userId &&
              // Nur Textnachrichten zählen
              message.type === "TEXT" &&
              // Der User steht nicht in readBy
              (!message.readBy || !message.readBy.includes(userId));

            if (isUnread) {
              chatUnreadCount++;
            }
          });

          // Den Zähler für diesen Chat aktualisieren
          setUnreadCounts((prev) => ({
            ...prev,
            [chatId]: chatUnreadCount,
          }));
        });

        // Merke dir das Unsubscribe im Ref
        unsubscribesRef.current.set(chatId, unsubscribeMessages);
      });

      // 2. Prüfe, ob wir einen Listener für Chats haben, die im aktuellen Snapshot
      // gar nicht mehr auftauchen (z. B. Chat wurde gelöscht oder User entfernt).
      for (const [oldChatId, unsub] of unsubscribesRef.current.entries()) {
        if (!currentChatIds.has(oldChatId)) {
          // Falls dieser Chat nicht mehr im Snapshot ist, unsubscriben und löschen
          unsub();
          unsubscribesRef.current.delete(oldChatId);
          setUnreadCounts((prev) => {
            const newCounts = { ...prev };
            delete newCounts[oldChatId];
            return newCounts;
          });
        }
      }
    });

    // Cleanup, wenn der Hook unmounted oder userId sich ändert
    return () => {
      // Haupt-Abhörer beenden
      unsubscribeChats();
      // Alle Message-Abhörer beenden
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current.clear();
    };
  }, [userId]);

  // Summe aller ungelesenen Nachrichten berechnen
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return totalUnreadCount;
};
