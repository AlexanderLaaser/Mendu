import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  query,
  collection,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Chat as ChatType } from "@/models/chat";

interface UseChatsProps {
  user: any; // Bei Bedarf anpassen
}

const useChats = ({ user }: UseChatsProps): ChatType[] | null => {
  const [chats, setChats] = useState<ChatType[] | null>(null);

  useEffect(() => {
    if (!user) {
      setChats(null);
      return;
    }
    console.log("Start Chat-Listener for user:", user.uid);

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: ChatType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        loaded.push({
          id: docSnap.id,
          participants: data.participants || [],
          createdAt: data.createdAt,
          lastMessage: data.lastMessage
            ? {
                text: data.lastMessage.text,
                senderId: data.lastMessage.senderId,
                createdAt: data.lastMessage.createdAt?.toDate() ?? new Date(),
              }
            : undefined,
          insiderCompany: data.insiderCompany,
          matchId: data.matchId ?? "",
          locked: data.locked ?? false,
          type: (data.type as "DIRECT" | "MARKETPLACE") || "DIRECT",
        });
      });
      console.log("Chats loaded:", loaded);
      setChats(loaded.length > 0 ? loaded : []);
    });

    return () => unsubscribe();
  }, [user]);

  return chats;
};

export default useChats;
