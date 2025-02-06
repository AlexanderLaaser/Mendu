// app/api/offers/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, getDoc } from "firebase/firestore";
import { Offer } from "@/models/offers";

// GET: Alle Offers aus Firestore abrufen
export async function GET() {
  try {
    const referralsCol = collection(db, "offers");
    const snapshot = await getDocs(referralsCol);
    const referrals: Offer[] = [];
    snapshot.forEach((doc) => {
      referrals.push({ id: doc.id, ...doc.data() } as Offer);
    });
    return NextResponse.json(referrals, { status: 200 });
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// POST: Ein neues Offer in Firestore erstellen
export async function POST(request: Request) {
  try {
    const data: Offer = await request.json();
    const { ...offerData } = data;

    const referralsCol = collection(db, "offers");
    const docRef = await addDoc(referralsCol, offerData);
    const newDoc = await getDoc(docRef);

    if (!newDoc.exists()) {
      return NextResponse.json(
        { success: false, message: "Erstelltes Dokument nicht gefunden." },
        { status: 404 }
      );
    }

    const newOffer: Offer = { id: docRef.id, ...newDoc.data() } as Offer;
    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    console.error("Fehler beim Erstellen des Datensatzes:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
