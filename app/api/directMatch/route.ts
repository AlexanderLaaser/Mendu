import { NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { User } from "@/models/user";
import { Match } from "@/models/match";
import { Chat, Message } from "@/models/chat";

/**
 * Hilfsfunktion, um aus den Benutzer-MatchSettings die Einträge einer bestimmten Kategorie zu erhalten.
 */
function getCategoryEntries(
  userData: Partial<User>,
  categoryName: string
): string[] {
  if (!userData?.matchSettings?.categories) return [];
  const cat = userData.matchSettings.categories.find(
    (c) => c.categoryName === categoryName
  );
  return cat ? cat.categoryEntries : [];
}

/**
 * Hilfsfunktion, um aus personalData die Sprachen zu extrahieren.
 * Wir werten nur "checked" und "language" aus – Level wird ignoriert,
 * da wir nur nach gemeinsamer Sprache filtern wollen.
 */
function getUserLanguages(userData: Partial<User>): string[] {
  if (!userData?.personalData?.languages) return [];
  return userData.personalData.languages
    .filter((lang) => lang.checked)
    .map((lang) => lang.language.toLowerCase());
}

/**
 * Berechnet den Match-Faktor nach folgender Gewichtung:
 * - Mindestens 1 gemeinsame Sprache => harte Bedingung (+0.2)
 * - Mindestens 1 gemeinsamer Skill => harte Bedingung (+0.1 pro Skill, max. +0.3)
 * - Position(en) => +0.2 (wenn mind. 1 Überschneidung)
 * - Company => +0.3 (wenn mind. 1 Überschneidung)
 *
 * Falls die harten Bedingungen (Sprache/Skill) nicht erfüllt sind, return 0.
 */
function calculateMatchFactor({
  overlapLanguages,
  overlapSkills,
  overlapPositions, // CODE-ÄNDERUNG: nun plural
  overlapCompanies,
}: {
  overlapLanguages: string[];
  overlapSkills: string[];
  overlapPositions: string[]; // CODE-ÄNDERUNG: Typ angepasst
  overlapCompanies: string[];
}): number {
  if (overlapLanguages.length === 0) return 0; // Harte Bedingung: Sprache
  if (overlapSkills.length === 0) return 0;    // Harte Bedingung: Mind. 1 Skill

  let factor = 20; // Sprache erfüllt => +0.2 (20 entspricht 20%)

  // Skills => +0.1 pro Skill, max. 0.3 (entspricht 10 bzw. 30)
  const skillScore = Math.min(overlapSkills.length * 10, 30);
  factor += skillScore;

  // Position(en) => +0.2 (optional)
  if (overlapPositions.length > 0) {
    factor += 20;
  }

  // Company => +0.3 (optional)
  if (overlapCompanies.length > 0) {
    factor += 30;
  }
  return factor;
}

/**
 * Findet den Kandidaten mit dem höchsten Match-Faktor im Vergleich zum Quellnutzer (sourceData).
 */
function getBestCandidate(
  sourceData: Partial<User>,
  candidates: Array<{ uid: string; data: Partial<User> }>
): {
  matchedUid: string | null;
  overlapCompany: string[];
  overlapPositions: string[]; // CODE-ÄNDERUNG: plural
  overlapSkills: string[];
  overlapLanguages: string[];
  bestFactor: number;
} {
  const sourceCompanies = getCategoryEntries(sourceData, "companies");
  const sourcePositions = getCategoryEntries(sourceData, "positions");
  const sourceSkills = getCategoryEntries(sourceData, "skills");
  const sourceLanguages = getUserLanguages(sourceData);

  let bestFactor = 0;
  let bestCandidate = {
    matchedUid: null as string | null,
    overlapCompany: [] as string[],
    overlapPositions: [] as string[], // CODE-ÄNDERUNG: Eigenschaft umbenannt
    overlapSkills: [] as string[],
    overlapLanguages: [] as string[],
    bestFactor: 0
  };

  for (const candidate of candidates) {
    const candidateCompanies = getCategoryEntries(candidate.data, "companies");
    const candidatePositions = getCategoryEntries(candidate.data, "positions");
    const candidateSkills = getCategoryEntries(candidate.data, "skills");
    const candidateLanguages = getUserLanguages(candidate.data);

    // Schnittmengen
    const overlapCompanies = sourceCompanies.filter((c) =>
      candidateCompanies.includes(c)
    );
    const overlapPositions = sourcePositions.filter((p) =>
      candidatePositions.includes(p)
    );
    const overlapSkills = sourceSkills.filter((s) =>
      candidateSkills.includes(s)
    );
    const overlapLanguages = sourceLanguages.filter((l) =>
      candidateLanguages.includes(l)
    );

    const factor = calculateMatchFactor({
      overlapLanguages,
      overlapSkills,
      overlapPositions, // CODE-ÄNDERUNG: Übergabe des Arrays
      overlapCompanies
    });

    console.log("factor: " + factor);

    if (factor > bestFactor) {
      bestFactor = factor;
      bestCandidate = {
        matchedUid: candidate.uid,
        overlapCompany: overlapCompanies,
        overlapPositions: overlapPositions, // CODE-ÄNDERUNG: Speichere Array
        overlapSkills,
        overlapLanguages,
        bestFactor: factor,
      };
    }
  }
  return bestCandidate;
}

/**
 * POST-Route zum Matching: 
 * - Statt nochmal die User-Daten aus Firestore zu laden, erhalten wir `userData` direkt vom Client.
 * - Dadurch sparen wir uns den erneuten DB-Call basierend auf der userId.
 */
export async function POST(request: Request) {
  try {
    // 1) Empfange das komplette User-Objekt vom Client
    type BodyPayload = {
      userData: User; // oder Partial<User>, falls optional
    };

    const body = (await request.json()) as BodyPayload;

    // Wenn im Body nichts ankommt
    if (!body.userData) {
      return NextResponse.json(
        { success: false, message: "Es wurden keine User-Daten übergeben." },
        { status: 400 }
      );
    }

    const userData = body.userData;
    const userId = userData.uid;

    if (!userId || !userData.role) {
      return NextResponse.json(
        {
          success: false,
          message: "Nutzer ist unvollständig (uid oder role fehlen).",
        },
        { status: 400 }
      );
    }

    // 2) Bestimme die Gegenrolle
    const oppositeRole: "Talent" | "Insider" =
      userData.role === "Talent" ? "Insider" : "Talent";

    // 3) Lade alle Opposite-User aus Firestore
    const oppositeQuery = query(
      collection(db, "users"),
      where("role", "==", oppositeRole)
    );
    const oppositeSnap = await getDocs(oppositeQuery);

    const allOppositeUsers = oppositeSnap.docs.map((doc) => ({
      uid: doc.id,
      data: doc.data() as Partial<User>,
    }));

    // 4) Ermittle den besten Kandidaten (höchster Match-Faktor)
    const {
      matchedUid,
      overlapCompany,
      overlapPositions, // CODE-ÄNDERUNG: Destructure plural
      overlapSkills,
      bestFactor
    } = getBestCandidate(userData, allOppositeUsers);

    if (!matchedUid || bestFactor === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Kein passender Kandidat gefunden (Du bist '${userData.role}', suchst '${oppositeRole}').`,
          matchFactor: 0,
        },
        { status: 200 }
      );
    }

    // CODE-ÄNDERUNG: Für company verwenden wir wie gehabt das erste Element, für Positionen das gesamte Array
    const finalCompany = overlapCompany[0] ?? "";
    const finalPositions = overlapPositions.length > 0 ? overlapPositions : [];

    // 5) Prüfe, ob bereits ein Match für diese Talent/Insider-Kombination existiert
    const matchQuery = query(
      collection(db, "matches"),
      where(userData.role === "Talent" ? "talentUid" : "insiderUid", "==", userId),
      where(userData.role === "Talent" ? "insiderUid" : "talentUid", "==", matchedUid),
      where("type", "==", "DIRECT")
    );
    const existingMatchesSnap = await getDocs(matchQuery);

    let matchId: string;
    const batch = writeBatch(db);

    if (existingMatchesSnap.empty) {
      
      // Neues Match-Dokument
      const newMatch: Omit<Match, "id"> = {
        talentUid: userData.role === "Talent" ? userId : matchedUid,
        insiderUid: userData.role === "Talent" ? matchedUid : userId,
        status: "FOUND",
        matchParameters: {
          company: finalCompany,
          positions: finalPositions, // CODE-ÄNDERUNG: Speichere alle gefundenen Positionen
          skills: overlapSkills,
        },
        type: "DIRECT",
        talentAccepted: false,
        insiderAccepted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        matchFactor: bestFactor,
      };

      const matchRef = doc(collection(db, "matches"));
      batch.set(matchRef, newMatch);
      matchId = matchRef.id;
    }

    // 6) Chat prüfen oder anlegen
    const chatQuery = query(collection(db, "chats"), where("matchId", "==", matchId));
    const existingChatsSnap = await getDocs(chatQuery);

    let chatId: string;
    if (!existingChatsSnap.empty) {
      chatId = existingChatsSnap.docs[0].id;
    } else {
      // Chat anlegen
      const newChat: Omit<Chat, "id" | "createdAt"> = {
        participants: [userId, matchedUid],
        insiderCompany: finalCompany,
        matchId,
        type: "DIRECT",
        messages: [],
      };
      const chatRef = doc(collection(db, "chats"));
      batch.set(chatRef, { ...newChat, createdAt: Timestamp.now() });
      chatId = chatRef.id;

      // Systemnachrichten
      const systemMessage1: Omit<Message, "id" | "readBy"> = {
        senderId: "SYSTEM",
        text:
          "Dein Mendu Match ist da! Du hast einen " +
          userData.role +
          " gefunden. Match Übereinstimmung: " +
          bestFactor + "%",
        createdAt: Timestamp.now(),
        type: "SYSTEM",
        recipientUid: [matchedUid],
      };

      const systemMessage2: Omit<Message, "id" | "readBy"> = {
        senderId: "SYSTEM",
        text:
          "Dein Mendu Match ist da! Du hast einen " +
          oppositeRole +
          " gefunden. Match Übereinstimmung: " +
          bestFactor + "%",
        createdAt: Timestamp.now(),
        type: "SYSTEM",
        recipientUid: [userId],
      };

      batch.update(chatRef, {
        messages: [systemMessage1, systemMessage2],
      });
    }

    // 7) Chat-ID im Match-Dokument aktualisieren
    const matchDocRef = doc(db, "matches", matchId);
    batch.update(matchDocRef, {
      chatId,
      updatedAt: Timestamp.now(),
    });

    // 8) Batch ausführen
    await batch.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Bester Kandidat gefunden und (ggf.) Match/Chat erstellt.",
        matchId,
        chatId,
        matchFactor: bestFactor,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Matching:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}