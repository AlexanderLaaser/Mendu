export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Match } from "@/models/match";

export async function GET(
  request: NextRequest,
  // CODE CHANGE: params als Promise
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CODE CHANGE: await params statt direktem params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "MatchId ist nicht angegeben." },
        { status: 400 }
      );
    }

    const matchRef = doc(db, "matches", id);
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