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
 * 2. Findet einen passenden Insider
 * 3. Prüft, ob bereits ein Chat für beide Teilnehmer existiert
 * 4. Legt nur dann einen neuen Chat an, wenn keiner existiert
 * 5. Speichert zusätzlich insiderCompany (Firma des Insiders)
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

    // 2. Talent laden (per __name__-Abfrage)
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

    // Kategorien laden
    const talentCompanies = getCategoryEntries(talentData, "companies");
    const talentPositions = getCategoryEntries(talentData, "positions");

    // 3. Insider suchen
    const insidersSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "Insider"))
    );

    let matchedInsiderUid: string | null = null;
    let matchedInsiderCompany: string | null = null;

    insidersSnap.forEach((insiderDoc) => {
      const insiderData = insiderDoc.data() as Partial<User>;

      const insiderCompanies = getCategoryEntries(insiderData, "companies");
      const insiderPositions = getCategoryEntries(insiderData, "positions");

      // Overlap
      const overlapCompanies = talentCompanies.some((c) =>
        insiderCompanies.includes(c)
      );
      const overlapPositions = talentPositions.some((p) =>
        insiderPositions.includes(p)
      );

      if (overlapCompanies && overlapPositions) {
        matchedInsiderUid = insiderDoc.id;
        // NEU: Erste Firma aus insiderCompanies
        matchedInsiderCompany =
          insiderCompanies.length > 0 ? insiderCompanies[0] : "Unbekannte Firma";
      }
    });

    if (!matchedInsiderUid) {
      // Kein passender Insider
      return NextResponse.json(
        { success: false, message: "Kein Insider passt." },
        { status: 200 }
      );
    }

    // 4. Prüfen, ob Chat bereits existiert
    const chatsSnap = await getDocs(
      query(collection(db, "chats"), where("participants", "array-contains", talentUid))
    );

    let chatExists = false;

    chatsSnap.forEach((chatDoc) => {
      const cData = chatDoc.data();
      const participants = cData.participants || [];
      if (
        Array.isArray(participants) &&
        participants.includes(talentUid) &&
        participants.includes(matchedInsiderUid)
      ) {
        chatExists = true;
      }
    });

    if (chatExists) {
      // Bereits Chat vorhanden -> kein neuer Chat
      return NextResponse.json({
        success: true,
        message: "Chat existiert bereits.",
      });
    }

    // 5. Neuen Chat anlegen, inkl. Insider-Firma
    const newChat = {
      participants: [talentUid, matchedInsiderUid],
      insiderCompany: matchedInsiderCompany,
      createdAt: serverTimestamp(),
      lastMessage: null,
    };

    const chatRef = await addDoc(collection(db, "chats"), newChat);

    // 6. Erfolg
    return NextResponse.json({
      success: true,
      chatId: chatRef.id,
      insiderUid: matchedInsiderUid,
      insiderCompany: matchedInsiderCompany,
    });
  } catch (error) {
    console.error("Fehler bei Matching:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
