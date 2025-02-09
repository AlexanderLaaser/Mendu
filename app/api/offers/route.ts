// app/api/offers/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore"; // <-- Anpassung: query & where importiert
import { Offer } from "@/models/offers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillsParam = searchParams.get("skills");
    const positionsParam = searchParams.get("positions");

    const userSkills = skillsParam ? skillsParam.split(",") : [];
    const userPositions = positionsParam ? positionsParam.split(",") : [];

    // Falls keine Filterkriterien vorhanden sind, geben wir ein leeres Array zurück
    if (userSkills.length === 0 && userPositions.length === 0) {
      return NextResponse.json([], { status: 200 }); // <-- Anpassung
    }

    const offersCol = collection(db, "offers");
    const offersMap = new Map<string, Offer>();

    // Firestore Query für Skills (array-contains-any)
    if (userSkills.length > 0) {
      const skillsQuery = query(offersCol, where("skills", "array-contains-any", userSkills));
      const snapshot = await getDocs(skillsQuery);
      snapshot.forEach((doc) => {
        offersMap.set(doc.id, { id: doc.id, ...doc.data() } as Offer);
      });
    }

    // Firestore Query für Positionen (in)
    if (userPositions.length > 0) {
      const positionsQuery = query(offersCol, where("position", "in", userPositions));
      const snapshot = await getDocs(positionsQuery);
      snapshot.forEach((doc) => {
        offersMap.set(doc.id, { id: doc.id, ...doc.data() } as Offer);
      });
    }

    const offers = Array.from(offersMap.values());
    return NextResponse.json(offers, { status: 200 });
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}