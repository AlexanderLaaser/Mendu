import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc, 
  updateDoc, 
} from "firebase/firestore";
import { User } from "@/models/user";
import { Match } from "@/models/match";
import { Chat } from "@/models/chat";

// Inline Kommentar: Hilfsfunktion wie gehabt
function getCategoryEntries(userData: Partial<User>, categoryName: string): string[] {
  if (!userData?.matchSettings?.categories) return [];
  const cat = userData.matchSettings.categories.find(
    (c) => c.categoryName === categoryName
  );
  return cat ? cat.categoryEntries : [];
}

export async function GET(request: NextRequest) {
  try {
    // Inline Kommentar: 1) Schritt: Alle Talents laden, die searchImmediately=true haben
    const talentsSnap = await getDocs(
      query(
        collection(db, "users"),
        where("role", "==", "Talent"),
        where("matchSettings.searchImmediately", "==", true)
      )
    );

    // Alle Insider laden
    const insidersSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "Insider"))
    );

    // Array aller Insider
    const allInsiders = insidersSnap.docs.map((doc) => ({
      uid: doc.id,
      data: doc.data() as Partial<User>,
    }));

    // Ergebnis-Array für Response
    const matchesCreated: Array<{
      talentUid: string;
      matchId: string;
      insiderUid: string;
      chatId: string;
    }> = [];

    // Über alle Talents iterieren
    for (const talentDoc of talentsSnap.docs) {
      const talentUid = talentDoc.id;
      const talentData = talentDoc.data() as Partial<User>;

      // Kategorien laden
      const talentCompanies = getCategoryEntries(talentData, "companies");
      const talentPositions = getCategoryEntries(talentData, "positions");

      // Matching-Logik (vereinfacht: Erster Insider mit Overlap)
      let matchedInsiderUid: string | null = null;
      let matchedInsiderCompany: string | null = null;
      let matchedPosition: string | null = null;

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
          matchedInsiderUid = insider.uid;
          matchedInsiderCompany = overlapCompanies[0];
          matchedPosition = overlapPositions[0];
          break; 
        }
      }

      // 5) Wenn kein Insider gefunden, Talent überspringen
      if (!matchedInsiderUid || !matchedInsiderCompany || !matchedPosition) {
        continue;
      }

      // 6) Prüfen, ob passendes Match schon existiert
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
        // Match vorhanden
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

        const matchRef = await addDoc(collection(db, "matches"), {
          ...newMatch,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        matchId = matchRef.id;
        newMatchCreated = true;
      }

      // 7) Chat prüfen oder anlegen
      const existingChatsSnap = await getDocs(
        query(collection(db, "chats"), where("matchId", "==", matchId))
      );

      let chatId: string;
      if (!existingChatsSnap.empty) {
        // Bereits vorhanden
        chatId = existingChatsSnap.docs[0].id;
      } else {
        // Neu anlegen
        const newChat: Omit<Chat, "id" | "createdAt"> = {
          participants: [matchedInsiderUid, talentUid],
          insiderCompany: matchedInsiderCompany,
          locked: true,
          matchId,
          type: "DIRECT",
        };

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
          recipientUid: talentUid,
        });
      }

      // chatId in das Match-Dokument schreiben
      await updateDoc(doc(db, "matches", matchId), {
        chatId,
        updatedAt: serverTimestamp(), // Datum für Nachvollziehbarkeit anpassen
      });

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