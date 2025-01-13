// app/api/match/accept/route.ts
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

    // Akzeptiert
    if (matchData.talentUid === userUid) {
      await updateDoc(matchRef, {
        talentAccepted: true,
        updatedAt: serverTimestamp(),
      });
    } else if (matchData.insiderUid === userUid) {
      await updateDoc(matchRef, {
        insiderAccepted: true,
        updatedAt: serverTimestamp(),
      });
    }

    // Updated Match-Daten erneut laden
    const updatedMatchSnap = await getDoc(matchRef);
    const updatedMatchData = updatedMatchSnap.data() as Match;
    let newStatus = updatedMatchData.status;

    // Wenn beide akzeptiert haben => CONFIRMED
    if (
      updatedMatchData.talentAccepted &&
      updatedMatchData.insiderAccepted
    ) {
      newStatus = "CONFIRMED";

      // Chat entsperren
      const chatsSnap = await getDocs(
        query(collection(db, "chats"), where("matchId", "==", matchId))
      );

      if (!chatsSnap.empty) {
        const chatDoc = chatsSnap.docs[0];

        // Lock aufheben
        await updateDoc(chatDoc.ref, {
          locked: false,
          updatedAt: serverTimestamp(),
        });

        // Systemnachricht hinzufügen
        await addDoc(collection(chatDoc.ref, "messages"), {
          text: "Das Match wurde von beiden Seiten akzeptiert! Der Chat ist jetzt freigeschaltet.",
          sender: "system",
          createdAt: serverTimestamp(),
        });
      }

      // Match Status auf CONFIRMED setzen
      await updateDoc(matchRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Nur eine Seite hat akzeptiert
      // => system message, dass userUid akzeptiert hat
      const chatsSnap = await getDocs(
        query(collection(db, "chats"), where("matchId", "==", matchId))
      );
      if (!chatsSnap.empty) {
        const chatDoc = chatsSnap.docs[0];

        await addDoc(collection(chatDoc.ref, "messages"), {
          text: "Du hast das Match akzeptiert. Wir warten noch auf die andere Seite ...",
          sender: "system",
          createdAt: serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ success: true, newStatus });
  } catch (error) {
    console.error("Fehler bei Match-Akzept:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
