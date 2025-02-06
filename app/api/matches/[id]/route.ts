export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Match } from "@/models/match";

// Destrukturiere den Kontext direkt, kein "await" nötig
export async function GET(
  { params }: { params: { id: string } } // CODE CHANGE: Direktes Destructuring des Kontext-Parameters
) {
  try {
    const matchId = params.id; // Kein await, da params bereits ein Objekt ist
    if (!matchId) {
      return NextResponse.json(
        { success: false, message: "MatchId ist nicht angegeben." },
        { status: 400 }
      );
    }

    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Match nicht gefunden." },
        { status: 404 }
      );
    }

    const matchData = matchSnap.data() as Match;
    return NextResponse.json(matchData, { status: 200 });
  } catch (error) {
    console.error("Fehler beim Abrufen des Match:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}