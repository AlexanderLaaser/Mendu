import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, query, where, QueryDocumentSnapshot } from "firebase/firestore"; 
import { Offer } from "@/models/offers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Mappt ein Firestore-Dokument auf ein Offer-Interface.
 * Wichtig ist, dass doc.id zuletzt die ID setzt, um vorhandene 'id'-Felder aus doc.data() zu überschreiben.
 */
function mapDocToOffer(doc: QueryDocumentSnapshot): Offer {
  const data = doc.data(); // wirft doc.data() in eine Variable
  return {
    ...data,        // <-- Spreadet zuerst alle Daten
    id: doc.id      // <-- Überschreibt abschließend die ggf. vorhandene 'id' mit doc.id
  } as Offer;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillsParam = searchParams.get("skills");
    const positionsParam = searchParams.get("positions");

    const userSkills = skillsParam ? skillsParam.split(",") : [];
    const userPositions = positionsParam ? positionsParam.split(",") : [];

    // Falls keine Filterkriterien vorhanden sind, geben wir ein leeres Array zurück
    if (userSkills.length === 0 && userPositions.length === 0) {
      return NextResponse.json([], { status: 200 }); 
    }

    const offersCol = collection(db, "offers");
    const offersMap = new Map<string, Offer>();

    // Firestore Query für Skills (array-contains-any)
    if (userSkills.length > 0) {
      const skillsQuery = query(offersCol, where("skills", "array-contains-any", userSkills));
      const snapshot = await getDocs(skillsQuery);
      snapshot.forEach((doc) => {
        const offer = mapDocToOffer(doc);
        offersMap.set(doc.id, offer);
      });
    }

    // Firestore Query für Positionen (in)
    if (userPositions.length > 0) {
      const positionsQuery = query(offersCol, where("position", "in", userPositions));
      const snapshot = await getDocs(positionsQuery);
      snapshot.forEach((doc) => {
        const offer = mapDocToOffer(doc);
        offersMap.set(doc.id, offer);
      });
    }

    // Statt Map zurückzugeben -> Array aus den Werten der Map
    console.log("offersMap", [...offersMap.values()]);
    return NextResponse.json([...offersMap.values()], { status: 200 });

  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}