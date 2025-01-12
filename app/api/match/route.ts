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
 * Erwartet { talentUid: string } im Request Body
 *
 * 1. Lädt das Talent und prüft, ob role === "Talent"
 * 2. Findet einen passenden Insider (inkl. *konkreter* Company+Position-Kombi)
 * 3. Prüft, ob bereits ein Match mit genau dieser Company+Position existiert
 *    - Falls ja, gibt das bestehende Match zurück
 *    - Falls nein, legt ein neues "Match"-Dokument an (status = "FOUND", insiderUid)
 * 4. Prüft, ob es dafür bereits ein Chat gibt
 *    - Falls nicht, wird ein Chat-Dokument (locked = true) angelegt
 * 5. Falls Chat neu angelegt, fügt eine Systemnachricht ins Chat: "Insider gefunden..."
 * 6. Antwortet mit { success, matchId, chatId, insiderUid, insiderCompany }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Body auslesen
    const body = await request.json();
    const { talentUid } = body;

    // Ohne talentUid -> 400
    if (!talentUid) {
      return NextResponse.json(
        { success: false, message: "Kein talentUid angegeben" },
        { status: 400 }
      );
    }

    // 2. Talent laden
    const talentSnap = await getDocs(
      query(collection(db, "users"), where("__name__", "==", talentUid))
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

    // Finde EINEN Insider, der mind. eine Company & Position matcht
    insidersSnap.forEach((insiderDoc) => {
      if (matchedInsiderUid) return; // schon gefunden, nicht weiter suchen

      const insiderData = insiderDoc.data() as Partial<User>;
      const insiderCompanies = getCategoryEntries(insiderData, "companies");
      const insiderPositions = getCategoryEntries(insiderData, "positions");

      // Einfacher Overlap-Check
      const overlapCompanies = talentCompanies.filter((c) =>
        insiderCompanies.includes(c)
      );
      const overlapPositions = talentPositions.filter((p) =>
        insiderPositions.includes(p)
      );

      // Wenn wir mind. eine Firma und eine Position als Overlap haben,
      // dann nimm z. B. die erste Firma und Position.
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
    //    => in collection(db, "matches") nach Document suchen,
    //       wo talentUid == talentUid, insiderUid == matchedInsiderUid,
    //       und matchParameters.company == matchedInsiderCompany,
    //       matchParameters.position == matchedPosition

    const existingMatchesSnap = await getDocs(
      query(
        collection(db, "matches"),
        where("talentUid", "==", talentUid),
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
        talentUid,
        insiderUid: matchedInsiderUid,
        status: "FOUND",
        matchParameters: {
          // Nur das, worauf gematcht wurde
          company: matchedInsiderCompany,
          position: matchedPosition,
        },
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
    let chatAlreadyExists = false;

    if (!existingChatsSnap.empty) {
      // Chat bereits vorhanden
      chatId = existingChatsSnap.docs[0].id;
      chatAlreadyExists = true;
    } else {
      // Chat anlegen (nur Talent als participant, locked = true)
      const newChat = {
        participants: [talentUid],
        insiderCompany: matchedInsiderCompany, // optional
        createdAt: serverTimestamp(),
        locked: true,
        matchId: matchId,
      };

      const chatRef = await addDoc(collection(db, "chats"), newChat);
      chatId = chatRef.id;

      // Systemnachricht einfügen
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: "SYSTEM",
        text: "Wir haben ein Talent für dich gefunden. Bitte schlage einen Termin vor.",
        createdAt: serverTimestamp(),
        type: "SYSTEM",
      });
    }

    // Nun die Erfolgsmeldung
    // Falls Match/Chat bereits existierten, haben wir jetzt einfach Refs
    return NextResponse.json(
      {
        success: true,
        // Falls gerade neu angelegt
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
