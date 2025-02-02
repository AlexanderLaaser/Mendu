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

    // 6. Erstelle ein neues Match-Dokument (ohne ID)
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
      createdAt: serverTimestamp()as Timestamp,
      updatedAt: serverTimestamp()as Timestamp,
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
      messages: [] // Initial leer, wird später mit Systemnachricht befüllt
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

    // 11. Erstelle die Systemnachricht
    const systemMessage: Omit<Message, "id" | "readBy"> = {
      text: `Ein ${role} ist auf dich aufmerksam geworden und möchte ein Referral mit dir besprechen!`,
      senderId: "SYSTEM",
      createdAt: serverTimestamp() as Timestamp,
      type: "SYSTEM",
      recipientUid: offerCreatorId, // Empfänger basierend auf der Rolle
    };

    // 12. Aktualisiere das Chat-Dokument, indem du die Systemnachricht setzt.
    // Falls du zukünftig weitere Nachrichten anhängen möchtest, solltest du hier anstatt eines Arrays
    // lieber eine Subcollection verwenden oder den existierenden Nachrichten-Array erweitern.
    batch.update(chatRef, {
      messages: [systemMessage],
    });

    // 13. Führe alle Batch-Operationen atomar aus
    await batch.commit();

    // 14. Erfolgs-Response zurückgeben
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
