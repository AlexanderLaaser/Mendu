// app/api/chats/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
// Optional: Interface/Typen importieren, falls vorhanden
import { Chat } from "@/models/chat";

// Export der Handler-Funktion für GET-Anfragen
export async function GET(request: Request) {
  //   - Search-Parameter aus der URL parsen
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  // Validierung für uid
  if (!uid) {
    return NextResponse.json({ error: "Fehlende oder ungültige userId" }, { status: 400 });
  }

  try {
    // Query gegen Firestore
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    // Mapping der Ergebnis-Dokumente
    const chats: Chat[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        participants: data.participants || [],
        createdAt: data.createdAt,
        lastMessage: data.lastMessage,
        insiderCompany: data.insiderCompany,
        matchId: data.matchId ?? "",
        locked: data.locked ?? false,
        type: data.type || "DIRECT",
      } as Chat;
    });

    //   - Anstatt res.status(200).json(...) nutzen wir NextResponse.json
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Fehler im Chat-Handler:", error);
    //   - Einheitliche NextResponse-Fehlerantwort
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
