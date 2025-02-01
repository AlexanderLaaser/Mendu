import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { Match } from "@/models/match";
import { Chat, Message } from "@/models/chat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * API-Route zum Erstellen eines Marktplatz-Matches, Chats und Systemnachrichten.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Body parsen
    const { currentUserId, offerCreatorId, role, offerData } = await request.json();

    // 2. Validierung der Request-Daten
    if (!currentUserId || !offerCreatorId || !role || !offerData) {
      return NextResponse.json(
        { success: false, message: "Ungültige Request-Daten." },
        { status: 400 }
      );
    }

    // 3. Bestimme, ob der anfragende Nutzer Insider oder Talent ist
    const isInsider = role === "Insider";

    // 4. Setze akzeptierte Flags basierend auf der Rolle
    const insiderAccepted = isInsider;
    const talentAccepted = !isInsider;

    // 6. Erstelle Match-Daten
    const matchData: Omit<Match, "id"> = {
      talentUid: isInsider ? offerCreatorId : currentUserId,
      insiderUid: isInsider ? currentUserId : offerCreatorId,
      matchParameters: {
        company: offerData.company,
        position: offerData.position,
      },
      type: "MARKETPLACE", // CODE CHANGE: Typ gemäß Interface in Großbuchstaben
      status: "FOUND",
      talentAccepted,
      insiderAccepted,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      // chatId wird später ergänzt
    };

    // 7. Match-Dokument in Firestore schreiben
    const matchRef = await addDoc(collection(db, "matches"), matchData);
    const matchId = matchRef.id;

    // 8. Erstelle Chat-Daten
    const chatData: Omit<Chat, "id" | "lastMessage"> = {
      participants: [offerCreatorId, currentUserId],
      insiderCompany: offerData.company, // optional
      createdAt: serverTimestamp() as Timestamp,
      locked: true,
      matchId: matchId,
      type: "MARKETPLACE", // CODE CHANGE: Typ gemäß Interface in Großbuchstaben
      messages: [] // CODE CHANGE: Nachrichtenfeld als leeres Array hinzugefügt
    };

    // 9. Chat-Dokument in Firestore schreiben
    const chatRef = await addDoc(collection(db, "chats"), chatData);
    const chatId = chatRef.id;

    // NEU: chatId in das Match-Dokument schreiben
    await updateDoc(doc(db, "matches", matchId), {
      chatId,
      updatedAt: serverTimestamp(),
    });

    // 10. Systemnachricht für den Chat erstellen
    const systemMessage: Omit<Message, "id" | "readBy"> = {
      text: `Ein ${role} ist auf dich aufmerksam geworden und möchte ein Referral mit dir besprechen!`,
      senderId: "SYSTEM",
      createdAt: serverTimestamp() as Timestamp,
      type: "SYSTEM",
      recipientUid: offerCreatorId, // Empfänger basierend auf der Rolle
    };

    // 11. CODE CHANGE: Systemnachricht direkt im Chat-Dokument speichern statt in einer Subcollection
    await updateDoc(doc(db, "chats", chatId), {
      messages: [systemMessage]
    });

    // 12. Erfolgs-Response zurückgeben
    return NextResponse.json(
      {
        success: true,
        matchId,
        chatId,
        message: "Marktplatz-Match, Chat & Systemnachricht erstellt.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Erstellen von Markt-Match & Chat:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
