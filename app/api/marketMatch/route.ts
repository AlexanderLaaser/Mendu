import { doc, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection } from "firebase/firestore";
import { Match } from "@/models/match";
import { Chat, Message } from "@/models/chat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // 5. Erstelle einen Batch, um alle Schreibvorgänge zusammenzufassen
    const batch = writeBatch(db);
    
    const matchData: Omit<Match, "id"> = {
      talentUid: isInsider ? offerCreatorId : currentUserId,
      insiderUid: isInsider ? currentUserId : offerCreatorId,
      matchParameters: {
        company: offerData.company,
        positions: Array.isArray(offerData.position)
          ? offerData.position
          : [offerData.position],
        skills: offerData.skills ?? [], // entweder leeres Array oder aus offerData
      },
      type: "MARKETPLACE", // Typ gemäß Interface in Großbuchstaben
      status: "FOUND",
      talentAccepted,
      insiderAccepted,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      // CODE-ÄNDERUNG: matchFactor ist im Interface gefordert, also hier hinzufügen
      matchFactor: 0,
      // chatId wird später ergänzt
    };

    // 7. Erstelle zunächst ein leeres Match-Dokument (damit du die ID erhältst)
    const matchRef = doc(collection(db, "matches"));
    batch.set(matchRef, matchData);
    const matchId = matchRef.id;

    // 8. Erstelle Chat-Daten
    const chatData: Omit<Chat, "id" | "lastMessage"> = {
      participants: [offerCreatorId, currentUserId],
      insiderCompany: offerData.company, // optional
      createdAt: serverTimestamp() as Timestamp,
      matchId: matchId,
      type: "MARKETPLACE",
      messages: [] // Initial leer, wird später mit Systemnachrichten befüllt
    };

    // 9. Erstelle ein leeres Chat-Dokument
    const chatRef = doc(collection(db, "chats"));
    batch.set(chatRef, chatData);
    const chatId = chatRef.id;

    // 10. Aktualisiere das Match-Dokument um den Chat-Reference hinzuzufügen
    batch.update(matchRef, {
      chatId,
      updatedAt: serverTimestamp(),
    });

    // 11. Erstelle die Systemnachricht für den offerCreator
    const systemMessage: Omit<Message, "id" | "readBy"> = {
      text: `Ein ${role} ist auf dich aufmerksam geworden und möchte ein Referral mit dir besprechen!`,
      senderId: "SYSTEM",
      createdAt: Timestamp.now(),
      type: "SYSTEM",
      recipientUid: offerCreatorId, // Empfänger: Angebotsersteller
    };

    // 11b. Erstelle eine Systemnachricht für den aktuellen User
    const systemMessageForCurrentUser: Omit<Message, "id" | "readBy"> = {
      text: "Deine Anfrage zum Referral wurde erfolgreich gestellt.",
      senderId: "SYSTEM",
      createdAt: Timestamp.now(),
      type: "SYSTEM",
      recipientUid: currentUserId, // Empfänger: aktueller User
    };

    // 12. Aktualisiere das Chat-Dokument, indem du beide Systemnachrichten setzt
    batch.update(chatRef, {
      messages: [systemMessage, systemMessageForCurrentUser],
    });

    // 13. Führe alle Batch-Operationen atomar aus
    await batch.commit();

    // 14. Erfolgs-Response zurückgeben
    return NextResponse.json(
      {
        success: true,
        matchId,
        chatId,
        message: "Marktplatz-Match, Chat & Systemnachrichten erstellt.",
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