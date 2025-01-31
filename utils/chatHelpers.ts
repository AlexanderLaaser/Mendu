// utils/chatHelpers.ts

import { db } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface CreateOrUpdateChatParams {
  chatId: string;
  participants: string[];       // [currentUserId, partnerId]
  insiderCompany: string;       // z. B. "ACME Inc."
}

export async function createOrUpdateChat({
  chatId,
  participants,
  insiderCompany
}: CreateOrUpdateChatParams) {
  const chatRef = doc(db, "chats", chatId);

  await setDoc(
    chatRef,
    {
      participants,
      insiderCompany,             // <-- hier wird die Firma abgelegt
      createdAt: serverTimestamp() // wenn neu, Timestamp; falls schon existiert, kein Problem
    },
    { merge: true }
  );

  // Fertig: Jetzt steht in chats/{chatId} das Feld `insiderCompany`.
}
