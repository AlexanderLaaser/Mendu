import { useEffect, useState } from "react";
import { Chat as ChatType } from "@/models/chat";

interface UseChatsProps {
  user: any;
}

const useChats = ({ user }: UseChatsProps): ChatType[] | null => {
  const [chats, setChats] = useState<ChatType[] | null>(null);

  useEffect(() => {
    if (!user) {
      setChats(null);
      return;
    }

    //  Fetch-Aufruf an /api/chats
    const fetchChatsForUser = async () => {
      try {
        //  Hier mit Backticks den String korrekt formatieren
        const res = await fetch(`/api/chats?uid=${user.uid}`);
        if (!res.ok) {
          throw new Error(`Fehler beim Laden der Chats. Status: ${res.status}`);
        }
        const data = await res.json();
        setChats(data);
      } catch (error) {
        console.error("Fehler beim API-Call:", error);
        setChats(null);
      }
    };

    fetchChatsForUser();
  }, [user]);

  return chats;
};

export default useChats;

