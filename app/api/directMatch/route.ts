// Inline Kommentar: Benötigte Imports
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { User } from "@/models/user"; // Inline Kommentar: User-Interface
import { Match } from "@/models/match";
import { Chat } from "@/models/chat";

function getCategoryEntries(userData: Partial<User>, categoryName: string): string[] {
  if (!userData?.matchSettings?.categories) return [];
  const cat = userData.matchSettings.categories.find(
    (c) => c.categoryName === categoryName
  );
  return cat ? cat.categoryEntries : [];
}

export async function POST(request: NextRequest) {
  try {
    // 1. Body auslesen
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Kein userId angegeben" },
        { status: 400 }
      );
    }

    // 2. User laden (Talent)
    const talentSnap = await getDocs(
      query(collection(db, "users"), where("__name__", "==", userId))
    );
    if (talentSnap.empty) {
      return NextResponse.json(
        { success: false, message: "Talent existiert nicht." },
        { status: 404 }
      );
    }

    // Inline Kommentar: Da wir nur einen Doc erwarten, greifen wir auf docs[0] zu
    const talentData = talentSnap.docs[0].data() as Partial<User>;
    if (talentData.role !== "Talent") {
      return NextResponse.json(
        { success: false, message: "Benutzer ist kein Talent." },
        { status: 400 }
      );
    }

    // Kategorien laden (Beispielhaft "companies" und "positions")
    const talentCompanies = getCategoryEntries(talentData, "companies");
    const talentPositions = getCategoryEntries(talentData, "positions");

    // 3. Passenden Insider suchen (Simpel: erster Insider mit Overlap)
    const insidersSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "Insider"))
    );

    let matchedInsiderUid: string | null = null;
    let matchedInsiderCompany: string | null = null;
    let matchedPosition: string | null = null;

    insidersSnap.forEach((insiderDoc) => {
      if (matchedInsiderUid) return; // schon gefunden, nicht weiter suchen

      const insiderData = insiderDoc.data() as Partial<User>;
      const insiderCompanies = getCategoryEntries(insiderData, "companies");
      const insiderPositions = getCategoryEntries(insiderData, "positions");

      const overlapCompanies = talentCompanies.filter((c) =>
        insiderCompanies.includes(c)
      );
      const overlapPositions = talentPositions.filter((p) =>
        insiderPositions.includes(p)
      );

      if (overlapCompanies.length > 0 && overlapPositions.length > 0) {
        matchedInsiderUid = insiderDoc.id;
        matchedInsiderCompany = overlapCompanies[0];
        matchedPosition = overlapPositions[0];
      }
    });

    if (!matchedInsiderUid || !matchedInsiderCompany || !matchedPosition) {
      // Kein passender Insider gefunden
      return NextResponse.json(
        { success: false, message: "Kein Insider passt." },
        { status: 200 }
      );
    }

    // 4. Prüfen, ob passendes Match schon existiert
    const existingMatchesSnap = await getDocs(
      query(
        collection(db, "matches"),
        where("talentUid", "==", userId),
        where("insiderUid", "==", matchedInsiderUid),
        where("matchParameters.company", "==", matchedInsiderCompany),
        where("matchParameters.position", "==", matchedPosition)
      )
    );

    let matchId: string;
    let newMatchCreated = false;

    if (!existingMatchesSnap.empty) {
      // Bereits ein Match vorhanden
      matchId = existingMatchesSnap.docs[0].id;
    } else {
      // Noch nicht vorhanden => Neues Match anlegen (typsicher mit Omit)
      // Inline Kommentar: "matchId" existiert noch nicht, da Firestore ihn generiert
      const newMatch: Omit<Match, "id" | "createdAt" | "updatedAt"> = {
        talentUid: userId,
        insiderUid: matchedInsiderUid,
        status: "FOUND",
        matchParameters: {
          company: matchedInsiderCompany,
          position: matchedPosition,
        },
        type: "DIRECT", // Inline Kommentar: Aus dem Interface "DIRECT" | "MARKETPLACE"
        talentAccepted: false,
        insiderAccepted: false,
        // chatIds lassen wir leer oder undefined, da noch kein Chat existiert
      };

      const matchRef = await addDoc(collection(db, "matches"), {
        ...newMatch,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      matchId = matchRef.id;
      newMatchCreated = true;
    }

    // 5. Prüfen, ob Chat existiert -> Chat abfragen, wo matchId == matchId
    const existingChatsSnap = await getDocs(
      query(collection(db, "chats"), where("matchId", "==", matchId))
    );

    let chatId: string;

    if (!existingChatsSnap.empty) {
      // Chat bereits vorhanden
      chatId = existingChatsSnap.docs[0].id;
    } else {
      // Neuen Chat anlegen: typisiert als Omit<Chat, "chatId" | "createdAt"> o.ä.
      const newChat: Omit<Chat, "id" | "createdAt"> = {
        participants: [matchedInsiderUid, userId],
        insiderCompany: matchedInsiderCompany,
        locked: true,
        matchId,
        type: "DIRECT", // Inline Kommentar: Nach Interface-Vorgabe
        // lastMessage: noch nicht vorhanden
      };

      // Inline Kommentar: Firestore wird statt Date ein Timestamp speichern
      const chatRef = await addDoc(collection(db, "chats"), {
        ...newChat,
        createdAt: serverTimestamp(),
      });
      chatId = chatRef.id;

      // Begrüßungs-Systemnachrichten
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: "SYSTEM",
        text: "Dein Mendu Match ist da! Talent gefunden...",
        createdAt: serverTimestamp(),
        type: "SYSTEM",
        recipientUid: matchedInsiderUid,
      });

      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: "SYSTEM",
        text: "Dein Mendu Match ist da! Insider gefunden...",
        createdAt: serverTimestamp(),
        type: "SYSTEM",
        recipientUid: userId,
      });
    }

    // Erfolgs-Response
    return NextResponse.json(
      {
        success: true,
        newMatchCreated,
        matchId,
        chatId,
        insiderUid: matchedInsiderUid,
        insiderCompany: matchedInsiderCompany,
        position: matchedPosition,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler bei Matching:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
