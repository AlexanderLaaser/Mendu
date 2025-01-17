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
import { User } from "@/models/user";

/**
 * Kategorien aus dem matchSettings-Objekt extrahieren (z. B. "companies", "positions")
 */
function getCategoryEntries(userData: Partial<User>, categoryName: string): string[] {
  if (!userData?.matchSettings?.categories) return [];
  const cat = userData.matchSettings.categories.find(
    (c) => c.categoryName === categoryName
  );
  return cat ? cat.categoryEntries : [];
}

/**
 * POST /api/match
 * Erwartet { userId: string } im Request Body
 *
 * 1. Lädt das Talent und prüft, ob role === "Talent"
 * 2. Findet einen passenden Insider (inkl. *konkreter* Company+Position-Kombi)
 * 3. Prüft, ob bereits ein Match mit genau dieser Company+Position existiert
 *    - Falls ja, gibt das bestehende Match zurück
 *    - Falls nein, legt ein neues "Match"-Dokument an (status = "FOUND", insiderUid)
 * 4. Legt (falls nicht vorhanden) ein Chat-Dokument an (locked = true),
 *    **mit beiden** (Talent & Insider) in participants
 * 5. Fügt eine Systemnachricht ins Chat hinzu
 * 6. Antwortet mit { success, matchId, chatId, insiderUid, insiderCompany }
 */
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

    // 2. User laden
    const talentSnap = await getDocs(
      query(collection(db, "users"), where("__name__", "==", userId))
    );
    if (talentSnap.empty) {
      return NextResponse.json(
        { success: false, message: "Talent existiert nicht." },
        { status: 404 }
      );
    }

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

    // 3. Passenden Insider suchen (Simpel: erster, der Overlap hat)
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
      // Kein passender Insider
      return NextResponse.json(
        { success: false, message: "Kein Insider passt." },
        { status: 200 }
      );
    }

    // 4. Prüfen, ob Match schon existiert (für diese EXACTE Company + Position)
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
      // Noch nicht vorhanden => Neues Match anlegen
      const matchData = {
        talentUid: userId, // Hier anpassen: talentUid, damit es klar bleibt
        insiderUid: matchedInsiderUid,
        status: "FOUND",
        matchParameters: {
          company: matchedInsiderCompany,
          position: matchedPosition,
        },
        talentAccepted: false,
        insiderAccepted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const matchRef = await addDoc(collection(db, "matches"), matchData);
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
      // Chat anlegen: beide in participants, locked = true
      const newChat = {
        participants: [matchedInsiderUid, userId],
        insiderCompany: matchedInsiderCompany,
        createdAt: serverTimestamp(),
        locked: true,
        matchId: matchId,
      };

      const chatRef = await addDoc(collection(db, "chats"), newChat);
      chatId = chatRef.id;

      // Option A: Systemnachricht für *beide* im Chat, aber client-seitig ausgeblendet.
      // Option B: Systemnachricht nur an eine bestimmte Seite (recipientUid).

      // Beispiel (nur Insider soll sie sehen):
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: "SYSTEM",
        text: "Dein Mendu Match ist da! Talent gefunden...",
        createdAt: serverTimestamp(),
        type: "SYSTEM",
        recipientUid: matchedInsiderUid,
      });

      // Beispiel (nur Talent soll sie sehen):
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: "SYSTEM",
        text: "Dein Mendu Match ist da! Insider gefunden...",
        createdAt: serverTimestamp(),
        type: "SYSTEM",
        recipientUid: userId, // <-- Nur Talent
      });
    }

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
