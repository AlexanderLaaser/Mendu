import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { Match } from "@/models/match";
import type { Message } from "@/models/chat";

// Anpassung: Interface erweitert um den Action-Typ, um zwischen Akzeptieren und Ablehnen zu unterscheiden
interface MatchActionRequest {
  matchId: string;
  userId: string;
  partnerId: string;
  action: "accept" | "decline"; // "accept": Match akzeptieren, "decline": Match ablehnen
}

interface ApiResponse {
  success: boolean;
  message?: string;
  newStatus?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // --- Request-Body parsen und typisieren
    const body: MatchActionRequest = await request.json();
    const { matchId, userId, partnerId, action } = body;

    if (!matchId || !userId || !partnerId || !action) {
      return NextResponse.json(
        { success: false, message: "Ungültige Parameter" },
        { status: 400 }
      );
    }

    // --- Match-Dokument laden und Existenz prüfen
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Match nicht gefunden" },
        { status: 404 }
      );
    }

    const matchData = matchSnap.data() as Match;

    // --- Prüfen, ob das Match bereits storniert oder abgelaufen ist
    if (matchData.status === "CANCELLED" || matchData.status === "EXPIRED") {
      return NextResponse.json(
        { success: false, message: "Match nicht mehr aktiv" },
        { status: 400 }
      );
    }

    // --- 3-Tage-Frist prüfen
    const now = Date.now();
    const createdAtMillis = matchData.createdAt?.toMillis?.() || now;
    const threeDaysMillis = 3 * 24 * 60 * 60 * 1000;
    if (now > createdAtMillis + threeDaysMillis) {
      await updateDoc(matchRef, {
        status: "EXPIRED",
        updatedAt: serverTimestamp(),
      });
      return NextResponse.json(
        { success: false, message: "Match abgelaufen" },
        { status: 200 }
      );
    }

    // --- Feld aktualisieren (abhängig von der Aktion und der Rolle des Users)
    const updateData: Partial<Match> = {
      updatedAt: Timestamp.now(),
    };

    if (action === "accept") {
      if (matchData.talentUid === userId) {
        updateData.talentAccepted = true; // Anpassung: Talent akzeptiert
      } else if (matchData.insiderUid === userId) {
        updateData.insiderAccepted = true; // Anpassung: Insider akzeptiert
      } else {
        return NextResponse.json(
          { success: false, message: "User nicht zu diesem Match zugeordnet" },
          { status: 400 }
        );
      }
    } else if (action === "decline") {
      if (matchData.talentUid === userId) {
        updateData.talentAccepted = false; // Anpassung: Talent lehnt ab
      } else if (matchData.insiderUid === userId) {
        updateData.insiderAccepted = false; // Anpassung: Insider lehnt ab
      } else {
        return NextResponse.json(
          { success: false, message: "User nicht zu diesem Match zugeordnet" },
          { status: 400 }
        );
      }
    }

    // --- Match-Dokument mit den neuen Daten updaten
    await updateDoc(matchRef, updateData);

    // --- Aktualisierte Match-Daten erneut laden
    const updatedMatchSnap = await getDoc(matchRef);
    const updatedMatchData = updatedMatchSnap.data() as Match;
    let newStatus = updatedMatchData.status;

    // --- Chat-Dokument anhand der matchId laden
    const chatsSnap = await getDocs(
      query(collection(db, "chats"), where("matchId", "==", matchId))
    );
    const chatDoc = !chatsSnap.empty ? chatsSnap.docs[0] : null;

    // --- Verarbeitung basierend auf der Aktion
    if (action === "accept") {
      // Wenn beide Seiten zugestimmt haben, wird das Match bestätigt
      if (updatedMatchData.talentAccepted && updatedMatchData.insiderAccepted) {
        newStatus = "CONFIRMED";

        if (chatDoc) {
          await updateDoc(chatDoc.ref, {
            messages: arrayUnion({
              text: "Das Match wurde von beiden Seiten akzeptiert! Der Chat ist jetzt freigeschaltet.",
              senderId: "SYSTEM",
              type: "SYSTEM",
              createdAt: Timestamp.now(),
              readBy: [],
              recipientUid: [userId, partnerId],
            } as Partial<Message>), // Clean Code: Typensichere Nachricht
          });
        }

        // Match-Status aktualisieren
        await updateDoc(matchRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Nur eine Seite hat akzeptiert → Benachrichtigung an den aktiven User
        if (chatDoc) {
          await updateDoc(chatDoc.ref, {
            messages: arrayUnion({
              text: "Du hast das Match akzeptiert.",
              senderId: "SYSTEM",
              type: "SYSTEM",
              createdAt: Timestamp.now(),
              readBy: [],
              recipientUid: [userId],
            } as Partial<Message>),
          });
        }
      }
    } else if (action === "decline") {
      // Bei Ablehnung wird das Match storniert
      newStatus = "CANCELLED";
      if (chatDoc) {
        await updateDoc(chatDoc.ref, {
          messages: arrayUnion(
            {
              text: "Du hast das Match abgelehnt. Das Match wurde storniert.",
              senderId: "SYSTEM",
              type: "SYSTEM",
              createdAt: Timestamp.now(),
              readBy: [],
              recipientUid: [userId],
            } as Partial<Message>,
            // Anpassung: System-Nachricht an den Partner bei Ablehnung
            {
              text: "Leider wurde das Match nicht bestätigt. Es wird nun storniert.",
              senderId: "SYSTEM",
              type: "SYSTEM",
              createdAt: Timestamp.now(),
              readBy: [],
              recipientUid: [partnerId],
            } as Partial<Message>
          ),
        });
      }
      await updateDoc(matchRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true, newStatus });
  } catch (error: unknown) {
    console.error("Fehler bei Match-Aktion:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
