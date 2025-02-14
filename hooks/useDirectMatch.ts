import { User } from "@/models/user";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseMatchProps {
  userData: User; 
  allCategoriesFilled: boolean;
  searchImmediately: boolean;
  setChatId: (id: string | null) => void;
}

const useDirectMatch = ({
  userData,
  allCategoriesFilled,
  searchImmediately,
  setChatId,
  
}: UseMatchProps) => {
  const hasFetchedMatch = useRef<boolean>(false);
  const [matchFactor, setMatchFactor] = useState<number>(0);

  const getMatch = useCallback(async () => {
    if (!userData || !userData.uid) return;
    try {
      // userId als Query-Parameter anhängen
      const res = await fetch(`/api/directMatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData: userData }),
      });
      if (!res.ok) {
        console.error("Fehler: /api/directMatch Status:", res.status);
        return;
      }
      const result = await res.json();
      if (result.success) {
        console.log("Match gefunden:", result.matchId);
        setChatId(result.chatId);

        // CODE-ÄNDERUNG: Hier holen wir uns den MatchFactor aus dem API-Result
        if (typeof result.matchFactor === "number") {
          setMatchFactor(result.matchFactor);
        } else {
          setMatchFactor(0);
        }
      } else {
        console.log("Kein Insider/Talent gefunden:", result.message);
        // MatchFactor auf 0 (kein Match)
        setMatchFactor(0);
      }
    } catch (error) {
      console.error("Fehler beim Matching:", error);
      // Falls ein Fehler auftritt, macht es Sinn, den MatchFactor zurückzusetzen
      setMatchFactor(0);
    }
  }, [userData, setChatId, setMatchFactor]);

  console.log(matchFactor)

  useEffect(() => {
    if (allCategoriesFilled && searchImmediately && !hasFetchedMatch.current) {
      hasFetchedMatch.current = true;
      getMatch();
    }
  }, [allCategoriesFilled, searchImmediately, getMatch]);

  return matchFactor;
};

export default useDirectMatch;