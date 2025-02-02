"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
// Importiere die Typen aus dem Modell
import { Chat, Message, MessageSummary } from "@/models/chat";
// Clean Code: Importiere benötigte Funktionen und Typen aus Firestore
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

// Definiere den Context-Wert type safe
interface ChatsContextValue {
  chats: Chat[] | null;
  loadingChats: boolean;
}

// Erstelle den Context mit einem Default-Wert
const ChatsContext = createContext<ChatsContextValue>({
  chats: null,
  loadingChats: true,
});

// Custom Hook zum Zugriff auf den ChatsContext
export function useChatsContext() {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChatsContext must be used within a ChatsProvider");
  }
  return context;
}

// Provider-Komponente, die den ChatsContext bereitstellt
export function ChatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    // Falls kein User vorhanden ist, setze den Zustand und beende den Effekt
    if (!user?.uid) {
      setChats(null);
      setLoadingChats(false);
      return;
    }

    // Erstelle den Query: Alle Chats, in denen der aktuelle User als Teilnehmer enthalten ist,
    // geordnet nach "createdAt" absteigend
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "desc")
    );

    // Setze den Snapshot Listener, um in Echtzeit Updates zu erhalten
    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        // Mapping der Firestore-Dokumente in Chat-Objekte (type safe)
        const chatsData: Chat[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            // Wir gehen davon aus, dass Firestore die erforderlichen Felder korrekt liefert.
            // Optional werden Fallbacks genutzt.
            participants: (data.participants as string[]) || [],
            insiderCompany: data.insiderCompany as string | undefined,
            matchId: (data.matchId as string) || "",
            createdAt: data.createdAt as Timestamp,
            lastMessage: data.lastMessage
              ? (data.lastMessage as MessageSummary)
              : undefined,
            type: (data.type as "DIRECT" | "MARKETPLACE") || "DIRECT",
            messages: data.messages ? (data.messages as Message[]) : undefined,
          };
        });
        // Aktualisiere den Zustand mit den neuen Chats
        setChats(chatsData);
        setLoadingChats(false);
      },
      (error) => {
        console.error("Fehler beim Abrufen der Chats:", error); // Fehlerprotokollierung
        setChats(null); // Bei Fehler, setze Chats auf null
        setLoadingChats(false);
      }
    );

    // Cleanup-Funktion: Entferne den Listener beim Unmount oder bei Änderung des Users
    return () => unsubscribe();
  }, [user]);

  return (
    <ChatsContext.Provider value={{ chats, loadingChats }}>
      {children}
    </ChatsContext.Provider>
  );
}
