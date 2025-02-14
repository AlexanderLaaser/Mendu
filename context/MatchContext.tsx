"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Match } from "@/models/match";
import { useAuth } from "@/context/AuthContext";

// Clean Code: Firestore-Funktionen importieren
import { db } from "@/firebase";
import { collection, onSnapshot, query, where, or } from "firebase/firestore";

// Definiere den Kontextwert type safe
interface MatchContextType {
  matches: Match[];
  loading: boolean;
}

// Erstelle den Context mit undefined als Initialwert
const MatchContext = createContext<MatchContextType | undefined>(undefined);

// Custom Hook zum Zugriff auf den MatchContext
export const useMatchContext = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error("useMatchContext must be used within a MatchProvider");
  }
  return context;
};

// Provider-Komponente, die alle Matches für den angemeldeten User in Echtzeit bezieht
export const MatchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const currentUserId = user?.uid;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Falls keine gültige currentUserId vorliegt, setze Matches leer und beende den Effekt
    if (!currentUserId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Erstelle den Query innerhalb des useEffect, wenn currentUserId definiert ist
    const matchesRef = collection(db, "matches");
    const matchesQuery = query(
      matchesRef,
      or(
        where("talentUid", "==", currentUserId),
        where("insiderUid", "==", currentUserId)
      )
    );

    // Setze den onSnapshot-Listener, um in Echtzeit Updates zu erhalten
    const unsubscribe = onSnapshot(matchesQuery, (querySnapshot) => {
      // Mapping der Firestore-Dokumente in type-safe Match-Objekte
      const loadedMatches: Match[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Hier wird explizit sichergestellt, dass die Felder dem Modell entsprechen.
        return {
          id: doc.id,
          talentUid: data.talentUid,
          insiderUid: data.insiderUid,
          matchParameters: data.matchParameters,
          type: data.type,
          status: data.status,
          talentAccepted: data.talentAccepted,
          insiderAccepted: data.insiderAccepted,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          chatId: data.chatId,
          matchFactor: data.matchFactor,
        } as Match;
      });
      setMatches(loadedMatches);
      setLoading(false);
    });

    // Cleanup-Funktion: Entfernt den Listener beim Unmount oder bei Änderung von currentUserId
    return () => unsubscribe();
  }, [currentUserId]);

  return (
    <MatchContext.Provider value={{ matches, loading }}>
      {children}
    </MatchContext.Provider>
  );
};
