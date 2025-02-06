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
function getCategoryEntries(userData: Partial<User>, categoryName: string): string[] {
  if (!userData?.matchSettings?.categories) return [];
  const cat = userData.matchSettings.categories.find(
    (c) => c.categoryName === categoryName
  );
  return cat ? cat.categoryEntries : [];
}

/**
 * Hilfsfunktion, die versucht, für ein Talent einen passenden Insider zu finden.
 * Sie überprüft, ob es Überschneidungen bei den Kategorien "companies" und "positions" gibt.
 */
async function findMatchingInsider(
  talentData: Partial<User>,
  talentUid: string,
  allInsiders: Array<{ uid: string; data: Partial<User> }>
): Promise<{
  matchedInsiderUid: string | null;
  matchedInsiderCompany: string | null;
  matchedPosition: string | null;
}> {
  const talentCompanies = getCategoryEntries(talentData, "companies");
  const talentPositions = getCategoryEntries(talentData, "positions");

  for (const insider of allInsiders) {
    const insiderCompanies = getCategoryEntries(insider.data, "companies");
    const insiderPositions = getCategoryEntries(insider.data, "positions");

    const overlapCompanies = talentCompanies.filter((c) =>
      insiderCompanies.includes(c)
    );
    const overlapPositions = talentPositions.filter((p) =>
      insiderPositions.includes(p)
    );

    if (overlapCompanies.length > 0 && overlapPositions.length > 0) {
      return {
        matchedInsiderUid: insider.uid,
        matchedInsiderCompany: overlapCompanies[0],
        matchedPosition: overlapPositions[0],
      };
    }
  }
  return { matchedInsiderUid: null, matchedInsiderCompany: null, matchedPosition: null };
}

/**
 * API-Route für den Cronjob, der:
 * 1. Alle Talents lädt, die "searchImmediately=true" haben.
 * 2. Alle Insider abruft.
 * 3. Für jedes Talent ein passendes Insider-Match ermittelt.
 * 4. Falls nötig, ein neues Match und einen Chat (inklusive Systemnachrichten) anlegt bzw. aktualisiert.
 */
export async function GET() {
  try {
    // 1) Alle Talents laden, die searchImmediately=true haben
    const talentsQuery = query(
      collection(db, "users"),
      where("role", "==", "Talent"),
      where("matchSettings.searchImmediately", "==", true)
    );
    const talentsSnap = await getDocs(talentsQuery);

    // 2) Alle Insider laden
    const insidersQuery = query(
      collection(db, "users"),
      where("role", "==", "Insider")
    );
    const insidersSnap = await getDocs(insidersQuery);

    // Array aller Insider mit UID und zugehörigen Daten
    const allInsiders = insidersSnap.docs.map((doc) => ({
      uid: doc.id,
      data: doc.data() as Partial<User>,
    }));

    // Ergebnis-Array, das für die Response verwendet wird
    const matchesCreated: Array<{
      talentUid: string;
      matchId: string;
      insiderUid: string;
      chatId: string;
    }> = [];

    // 3) Über alle Talents iterieren
    for (const talentDoc of talentsSnap.docs) {
      const talentUid = talentDoc.id;
      const talentData = talentDoc.data() as Partial<User>;

      // 4) Über die Hilfsfunktion versuchen, einen passenden Insider zu finden
      const {
        matchedInsiderUid,
        matchedInsiderCompany,
        matchedPosition,
      } = await findMatchingInsider(talentData, talentUid, allInsiders);

      // 5) Falls kein Insider gefunden wurde, Talent überspringen
      if (!matchedInsiderUid || !matchedInsiderCompany || !matchedPosition) {
        continue;
      }

      // 6) Prüfen, ob ein passendes Match bereits existiert
      const matchQuery = query(
        collection(db, "matches"),
        where("talentUid", "==", talentUid),
        where("insiderUid", "==", matchedInsiderUid),
        where("matchParameters.company", "==", matchedInsiderCompany),
        where("matchParameters.position", "==", matchedPosition)
      );
      const existingMatchesSnap = await getDocs(matchQuery);

      let matchId: string;
      // Erstelle einen Batch für alle Schreiboperationen, die zu diesem Talent gehören
      const batch = writeBatch(db);

      if (!existingMatchesSnap.empty) {
        // Ein passendes Match existiert bereits – verwende dessen ID
        matchId = existingMatchesSnap.docs[0].id;
      } else {
        // Neues Match anlegen
        const newMatch: Omit<Match, "id" | "createdAt" | "updatedAt"> = {
          talentUid,
          insiderUid: matchedInsiderUid,
          status: "FOUND",
          matchParameters: {
            company: matchedInsiderCompany,
            position: matchedPosition,
          },
          type: "DIRECT",
          talentAccepted: false,
          insiderAccepted: false,
        };

        // Erstelle ein neues Match-Dokument, um die automatisch generierte ID zu erhalten
        const matchRef = doc(collection(db, "matches"));
        batch.set(matchRef, {
          ...newMatch,
          createdAt: Timestamp.now(), 
          updatedAt: Timestamp.now(), 
        });
        matchId = matchRef.id;
      }

      // 7) Chat prüfen oder anlegen
      const chatQuery = query(
        collection(db, "chats"),
        where("matchId", "==", matchId)
      );
      const existingChatsSnap = await getDocs(chatQuery);

      let chatId: string;
      if (!existingChatsSnap.empty) {
        // Chat existiert bereits – verwende dessen ID
        chatId = existingChatsSnap.docs[0].id;
      } else {
        // Neuer Chat anlegen
        const newChat: Omit<Chat, "id" | "createdAt"> = {
          participants: [matchedInsiderUid, talentUid],
          insiderCompany: matchedInsiderCompany,
          matchId,
          type: "DIRECT",
          messages: [],
        };
        const chatRef = doc(collection(db, "chats"));
        batch.set(chatRef, {
          ...newChat,
          createdAt: Timestamp.now(),
        });
        chatId = chatRef.id;

        // 8) Systemnachrichten vorbereiten
        const systemMessage1: Omit<Message, "id" | "readBy"> = {
          senderId: "SYSTEM",
          text: "Dein Mendu Match ist da! Talent gefunden...",
          createdAt: Timestamp.now(),
          type: "SYSTEM",
          recipientUid: [matchedInsiderUid]

        };

        const systemMessage2: Omit<Message, "id" | "readBy"> = {
          senderId: "SYSTEM",
          text: "Dein Mendu Match ist da! Insider gefunden...",
          createdAt: Timestamp.now(),
          type: "SYSTEM",
          recipientUid: [talentUid]
        };

        // Systemnachrichten direkt im Chat-Dokument speichern (als Array)
        batch.update(chatRef, {
          messages: [systemMessage1, systemMessage2],
        });
      }

      // 9) Chat-ID in das Match-Dokument schreiben und das Update vermerken
      const matchDocRef = doc(db, "matches", matchId);
      batch.update(matchDocRef, {
        chatId,
        updatedAt: Timestamp.now(),
      });

      // 10) Alle Batch-Operationen für das aktuelle Talent atomar ausführen
      await batch.commit();

      // Ergebnis für dieses Talent speichern
      matchesCreated.push({
        talentUid,
        matchId,
        insiderUid: matchedInsiderUid,
        chatId,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cronjob Matching beendet.",
        matchesCreated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Cronjob-Matching:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
