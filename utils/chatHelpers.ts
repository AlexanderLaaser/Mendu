// utils/chatHelpers.ts

import { db } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface CreateOrUpdateChatParams {
  chatId: string;
  participants: string[];       // [currentUserId, partnerId]
  insiderCompany: string;       // z. B. "ACME Inc."
}

/**
 * Legt ein Chat-Dokument in /chats/{chatId} an oder aktualisiert es,
 * um das Feld `insiderCompany` zu speichern, damit ChatList
 * diese Info direkt aus dem Haupt-Dokument laden kann.
 */
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
