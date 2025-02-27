"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import { useAuth } from "@/context/AuthContext";
import LoadingIcon from "@/public/Loading";
import MatchStatus from "@/components/main/matches/MatchStatus";
import MatchContainer from "@/components/main/matches/MatchContainer";
import { useUserDataContext } from "@/context/UserDataContext";
import { useMatchContext } from "@/context/MatchContext";

export default function Page() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData } = useUserDataContext();
  const { matches, loading: loadingMatches } = useMatchContext();

  const [chatId, setChatId] = useState<string | null>(null);
  const searchImmediately = userData?.matchSettings?.searchImmediately ?? false;

  // Falls noch kein aktiver Chat gewählt ist, wähle automatisch den ersten
  useEffect(() => {
    if (!chatId && matches && matches.length > 0) {
      setChatId(matches[0].chatId);
    }
  }, [chatId, matches]);

  // Sortiere die Matches nach createdAt (aktuellstes Match oben)
  const sortedMatches = useMemo(() => {
    if (!matches) return [];
    return [...matches].sort((a, b) => {
      const timeA = a.createdAt.toDate().getTime();
      const timeB = b.createdAt.toDate().getTime();
      return timeB - timeA;
    });
  }, [matches]);

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

        <div className="flex flex-col md:flex-row flex-1 mt-4">
          {sortedMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-green-600">
              <span className="text-black mt-2">Keine Matches vorhanden!</span>
            </div>
          ) : (
            <MatchContainer
              matches={sortedMatches}
              chatId={chatId}
              setChatId={setChatId}
              defaultMatchId={sortedMatches[0]?.id}
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
