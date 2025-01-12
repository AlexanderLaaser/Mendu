// app/api/match/acceptTime/route.ts (App Router-Beispiel)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, chatId, userUid, date, time } = body;

    // Validierung
    if (!matchId || !chatId || !userUid || !date || !time) {
      return NextResponse.json(
        { success: false, message: "Fehlende Parameter" },
        { status: 400 }
      );
    }

    // Match-Dokument lesen
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Match-Dokument existiert nicht." },
        { status: 404 }
      );
    }

    // 1) Status auf "CONFIRMED" setzen + acceptedTime
    await updateDoc(matchRef, {
      status: "CONFIRMED",
      acceptedTime: { date, time, byUid: userUid },
      updatedAt: serverTimestamp(),
    });

    // 2) Chat entsperren
    const chatRefFire = doc(db, "chats", chatId);
    await updateDoc(chatRefFire, {
      locked: false,
    });

    // 3) SYSTEM-Nachricht => "Termin bestätigt, Chat freigeschaltet"
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: "SYSTEM",
      text: "Der vorgeschlagene Termin wurde bestätigt! Der Chat ist jetzt freigeschaltet.",
      createdAt: serverTimestamp(),
      type: "SYSTEM",
    });

    return NextResponse.json(
      { success: true, message: "Termin bestätigt, Chat freigeschaltet" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler in acceptTime:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
