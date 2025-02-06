import { User } from "@/models/user";
import { useCallback, useEffect, useRef } from "react";

interface UseMatchProps {
  user: User; 
  allCategoriesFilled: boolean;
  searchImmediately: boolean;
  setChatId: (id: string | null) => void;

}

const useDirectMatch = ({
  user,
  allCategoriesFilled,
  searchImmediately,
  setChatId,

}: UseMatchProps) => {
  const hasFetchedMatch = useRef<boolean>(false);

  const getMatch = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/directMatch", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        console.error("Fehler: /api/directMatch Status:", res.status);
        return;
      }
      const result = await res.json();
      if (result.success) {
        console.log("Match gefunden:", result.matchId);
        setChatId(result.chatId);
      } else {
        console.log("Kein Insider gefunden:", result.message);
        // Optional: Implementiere Retry-Logik oder andere Maßnahmen
      }
    } catch (error) {
      console.error("Fehler beim Matching:", error);
    }
  }, [user, setChatId]);

  useEffect(() => {
    if (allCategoriesFilled && searchImmediately && !hasFetchedMatch.current) {
      hasFetchedMatch.current = true;
      getMatch();
    }
  }, [allCategoriesFilled, searchImmediately, getMatch]);

  return;
};

export default useDirectMatch;
