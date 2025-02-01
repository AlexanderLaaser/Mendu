"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import useChats from "@/hooks/useChats";
import { useAuth } from "@/context/AuthContext";
import { Chat } from "@/models/chat";

interface ChatsContextValue {
  chats: Chat[] | null;
  loadingChats: boolean;
}

const ChatsContext = createContext<ChatsContextValue>({
  chats: null,
  loadingChats: true,
});

export function useChatsContext() {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChatsContext must be used within a ChatsProvider");
  }
  return context;
}

export function ChatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const chatsData = useChats({ user });

  const [chats, setChats] = useState<Chat[] | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (chatsData) {
      setChats(chatsData);
      setLoadingChats(false);
    }
  }, [chatsData]);

  return (
    <ChatsContext.Provider value={{ chats, loadingChats }}>
      {children}
    </ChatsContext.Provider>
  );
}
