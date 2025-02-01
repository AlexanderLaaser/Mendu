"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Match } from "@/models/match";
import { useAuth } from "@/context/AuthContext";

// Typdefinition für den Kontextinhalt
interface MatchContextType {
  matches: Match[];
  loading: boolean;
  refreshMatches: () => void;
}

// Context-Initialisierung
const MatchContext = createContext<MatchContextType | undefined>(undefined);

// Custom Hook für den einfachen Zugriff auf den MatchContext
export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error("useMatch must be used within a MatchProvider");
  }
  return context;
};

// Provider-Komponente, die alle Matches für den angemeldeten User lädt und bereitstellt
export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const currentUserId = user?.uid;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Clean Code: fetchUserMatches in den Kontext ausgelagert und als refreshMatches bereitgestellt
  const fetchUserMatches = async (): Promise<void> => {
    if (!currentUserId) {
      setMatches([]); // Clean Code: Leere Matches setzen, falls kein User angemeldet ist
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/matches?userId=${currentUserId}`);
      if (!response.ok) {
        console.error("Fehler beim Abrufen der Matches", response.statusText);
        return;
      }
      const data: Match[] = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Fehler beim Abruf der Matches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clean Code: Abhängigkeit von currentUserId führt zu erneuten Abrufen, wenn sich der User ändert
  useEffect(() => {
    fetchUserMatches();
  }, [currentUserId]);

  // Clean Code: Exponiere die Funktion zum manuellen Aktualisieren der Matches
  const refreshMatches = () => {
    fetchUserMatches();
  };

  return (
    <MatchContext.Provider value={{ matches, loading, refreshMatches }}>
      {children}
    </MatchContext.Provider>
  );
};
