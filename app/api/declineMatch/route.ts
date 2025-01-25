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
  addDoc,
} from "firebase/firestore";
import { Match } from "@/models/match";

export async function POST(request: NextRequest) {
  try {
    const { matchId, userUid } = await request.json();

    if (!matchId || !userUid) {
      return NextResponse.json(
        { success: false, message: "Ungültige Parameter" },
        { status: 400 }
      );
    }

    // --- Match-Dokument laden
    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Match nicht gefunden" },
        { status: 404 }
      );
    }

    const matchData = matchSnap.data() as Match;

    // Falls das Match bereits gecancelt oder abgelaufen ist -> abbrechen
    if (matchData.status === "CANCELLED" || matchData.status === "EXPIRED") {
      return NextResponse.json(
        { success: false, message: "Match nicht mehr aktiv" },
        { status: 400 }
      );
    }

    // 3-Tage-Frist prüfen
    const now = Date.now();
    const createdAtMillis = matchData.createdAt?.toMillis?.() || now;
    const threeDaysMillis = 3 * 24 * 60 * 60 * 1000;
    const deadline = createdAtMillis + threeDaysMillis;

    if (now > deadline) {
      await updateDoc(matchRef, {
        status: "EXPIRED",
        updatedAt: serverTimestamp(),
      });
      return NextResponse.json(
        { success: false, message: "Match abgelaufen" },
        { status: 200 }
      );
    }

    // Sobald einer ablehnt -> CANCELLED
    const newStatus = "CANCELLED";
    await updateDoc(matchRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    // Im Chat ggf. Systemnachricht hinzufügen
    const chatsSnap = await getDocs(
      query(collection(db, "chats"), where("matchId", "==", matchId))
    );

    if (!chatsSnap.empty) {
      const chatDoc = chatsSnap.docs[0];

      // System-Nachricht anlegen
      await addDoc(collection(chatDoc.ref, "messages"), {
        text: "Du hast das Match abgelehnt. Wir suchen nach weiteren Matches für dich!",
        sender: "system",
        createdAt: serverTimestamp(),
      });

      // Optional: Chat sperren oder sonstiges Handling
      // await updateDoc(chatDoc.ref, {
      //   locked: true,
      //   updatedAt: serverTimestamp(),
      // });
    }

    return NextResponse.json({ success: true, newStatus });
  } catch (error) {
    console.error("Fehler bei Match-Ablehnung:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
