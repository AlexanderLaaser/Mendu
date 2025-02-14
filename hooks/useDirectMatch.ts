// useDirectMatch.tsx
// CODE-ÄNDERUNG: userData nicht mehr als Hook-Parameter in useDirectMatch selbst übergeben,
// sondern als Parameter in getMatch(). So stellst du sicher, dass du immer die aktuellsten Daten verwendest.

import { User } from "@/models/user";
import { useCallback } from "react";

export default function useDirectMatch() {
  const getMatch = useCallback(async (userData: User) => {
    if (!userData || !userData.uid) return;

    try {
      const res = await fetch("/api/directMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData }),
      });

      if (!res.ok) {
        console.error("Fehler: /api/directMatch Status:", res.status);
        return;
      }

      const result = await res.json();
      if (result.success) {
        console.log("Match gefunden:", result.matchId);
      } else {
        console.log("Kein Insider/Talent gefunden:", result.message);
      }
    } catch (error) {
      console.error("Fehler beim Matching:", error);
    }
  }, []);

  return { getMatch };
}