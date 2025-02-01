"use client";

import React, { useState, useEffect } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import { useAuth } from "@/context/AuthContext";
import LoadingIcon from "@/public/Loading";
import MatchStatus from "@/components/main/matches/MatchStatus";
import MatchContainer from "@/components/main/matches/MatchContainer";
import { useUserDataContext } from "@/context/UserDataContext";
import useDirectMatch from "@/hooks/useDirectMatch";
import { useMatch } from "@/context/MatchContext";

export default function Page() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData } = useUserDataContext();

  // <-- Clean Code: Matches werden aus dem MatchContext bezogen
  const { matches, loading: loadingMatches } = useMatch();

  // State für den aktuell ausgewählten Chat (z.B. anhand eines Match-Objekts)
  const [chatId, setChatId] = useState<string | null>(null);

  const searchImmediately = userData?.matchSettings?.searchImmediately ?? false;

  const checkAllCategoriesFilled = () => {
    if (!userData?.matchSettings?.categories) return false;
    const requiredCategories = ["companies", "industries", "positions"];
    return requiredCategories.every((cat) =>
      userData.matchSettings?.categories.some(
        (category) =>
          category.categoryName === cat && category.categoryEntries.length > 0
      )
    );
  };
  const allCategoriesFilled = checkAllCategoriesFilled();

  useDirectMatch({
    user,
    allCategoriesFilled,
    searchImmediately,
    setChatId,
  });

  // Falls noch kein aktiver Chat gewählt ist, wähle automatisch den ersten aus den Matches
  useEffect(() => {
    if (!chatId && matches && matches.length > 0) {
      // <-- Clean Code: Annahme, dass jedes Match ein "chatId"-Feld enthält
      setChatId(matches[0].chatId);
    }
  }, [chatId, matches]);

  // ------------------------------------------------
  // Loading / Auth-Check
  // ------------------------------------------------
  if (loadingAuth || loadingData || loadingMatches) {
    return <LoadingIcon />;
  }
  if (!user) {
    return <div>Bitte melde dich an, um dein Dashboard zu sehen.</div>;
  }
  if (!matches) {
    return <LoadingIcon />;
  }

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      {/* OBERER BEREICH */}
      <MatchStatus searchImmediately={searchImmediately} />

      {/* MATCHES */}
      <DashboardCard className="flex-col bg-white">
        <h2 className="text-xl">Matches</h2>

        <div className="flex flex-1 mt-4">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-green-600">
              <span className="text-black mt-2">Keine Matches vorhanden!</span>
            </div>
          ) : (
            // <-- Clean Code: Übergabe der Matches (und Chat-Handling) an MatchContainer
            <MatchContainer
              matches={matches}
              chatId={chatId}
              setChatId={setChatId}
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
