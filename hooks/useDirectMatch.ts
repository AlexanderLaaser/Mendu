// useDirectMatch.tsx
import { User } from "@/models/user";
import { useCallback } from "react";

interface UseMatchProps {
  userData: User; 
}

// CODE-ÄNDERUNG: Hook ruft Matching nicht mehr automatisch in useEffect auf
export default function useDirectMatch({ userData }: UseMatchProps) {

  // CODE-ÄNDERUNG: getMatch kann nun manuell aufgerufen werden
  const getMatch = useCallback(async () => {
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
  }, [userData]);

  return { getMatch };
}