// app/api/match/proposeTime/route.ts (App Router-Beispiel)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, chatId, talentUid, date, time } = body;

    // Validierung
    if (!matchId || !chatId || !talentUid || !date || !time) {
      return NextResponse.json(
        { success: false, message: "Fehlende Parameter" },
        { status: 400 }
      );
    }

    // Match-Dokument lesen, um insiderUid zu erhalten
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Match-Dokument existiert nicht." },
        { status: 404 }
      );
    }
    const matchData = matchSnap.data() || {};
    const insiderUid = matchData.insiderUid;
    if (!insiderUid) {
      return NextResponse.json(
        { success: false, message: "Kein insiderUid im Match vorhanden." },
        { status: 400 }
      );
    }

    // 1) Match auf "CALENDAR_NEGOTIATION" setzen
    await updateDoc(matchRef, {
      status: "CALENDAR_NEGOTIATION",
      updatedAt: serverTimestamp(),
      // Optionale Speicherung im Match, falls gewünscht:
      // proposedTimes: arrayUnion({ date, time, byUid: talentUid })
    });

    // 2) Insider dem Chat hinzufügen
    const chatRefFire = doc(db, "chats", chatId);
    await updateDoc(chatRefFire, {
      participants: arrayUnion(insiderUid),
      // locked bleibt true, bis Termin final akzeptiert wird
    });

    // 3) CALENDAR-Nachricht ins Chat
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: talentUid,
      text: `Terminvorschlag: ${date} um ${time} (z.B. Calendly-Link)`,
      createdAt: serverTimestamp(),
      type: "CALENDAR",
    });

    return NextResponse.json(
      { success: true, message: "Terminvorschlag gesendet" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler in proposeTime:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
