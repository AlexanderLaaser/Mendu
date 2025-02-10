// CODE CHANGE: "await" auf params angewandt
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Offer } from "@/models/offers";

// PUT: Ein bestehendes Offer aktualisieren
export async function PUT(
  request: NextRequest,
  // CODE CHANGE: params als Promise => await im Code
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // CODE CHANGE: ID-Destructuring mit "await"
    const { id: OfferId } = await params;

    if (!OfferId) {
      return NextResponse.json(
        { success: false, message: "OfferId ist nicht angegeben." },
        { status: 400 }
      );
    }

    // Request-Body lesen
    const data: Partial<Offer> = await request.json();
    const offerRef = doc(db, "offers", OfferId);

    // Dokument in Firestore aktualisieren
    await updateDoc(offerRef, data);

    // Aktualisiertes Dokument auslesen
    const updatedSnap = await getDoc(offerRef);
    if (!updatedSnap.exists()) {
      return NextResponse.json(
        { success: false, message: "Offer nicht gefunden." },
        { status: 404 }
      );
    }

    const updatedOffer = { id: updatedSnap.id, ...updatedSnap.data() } as Offer;
    return NextResponse.json(updatedOffer, { status: 200 });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Datensatzes:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// DELETE: Ein bestehendes Offer löschen
export async function DELETE(
  request: NextRequest,
  // CODE CHANGE: params als Promise => await im Code
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: OfferId } = await params;

    if (!OfferId) {
      return NextResponse.json(
        { success: false, message: "OfferId ist nicht angegeben." },
        { status: 400 }
      );
    }

    const offerRef = doc(db, "offers", OfferId);
    await deleteDoc(offerRef);

    return NextResponse.json(
      { success: true, message: "Gelöscht" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fehler beim Löschen des Datensatzes:", error);
    return NextResponse.json(
      { success: false, message: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}