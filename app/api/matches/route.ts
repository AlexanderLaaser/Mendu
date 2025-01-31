// app/api/matches/route.ts
import { NextResponse } from "next/server";
import { collection, getDocs, query, where, or } from "firebase/firestore"; // <-- ggf. anpassen, je nach Firebase-Version
import { db } from "@/firebase";
import { Match } from "@/models/match";

// <-- Änderungen: GET-Handler exportieren, um GET-Anfragen zu unterstützen
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Fehlender userId-Parameter" }, { status: 400 });
  }

  try {
    // Query, um alle Matches zu holen, bei denen entweder talentUid oder insiderUid gleich userId ist
    const matchesRef = collection(db, "matches");
    // Hinweis: Bei neueren Firebase-Versionen kann der `or`-Operator anders gehandhabt werden.
    const q = query(
      matchesRef,
      or(where("talentUid", "==", userId), where("insiderUid", "==", userId))
    );

    const snapshot = await getDocs(q);
    const allMatches: Match[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }) as Match);

    return NextResponse.json(allMatches);
  } catch (error) {
    console.error("Fehler beim Abrufen der Matches:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
