// CODE CHANGE: dynamische Route in Next.js (App Router) ab 13.4
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server"; 
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Match } from "@/models/match";

type Context = {
  params: {
    id: string;
  };
};

export async function GET(

  request: Request,
  { params }: Context
) {
  try {
    const matchId = params.id;

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