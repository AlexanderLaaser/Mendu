"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import { useAuth } from "@/context/AuthContext";
import LoadingIcon from "@/public/Loading";
import useMatch from "@/hooks/useMatch";
import useChats from "@/hooks/useChats";
import MatchStatus from "@/components/main/matches/MatchStatus";
import MatchContainer from "@/components/main/matches/MatchContainer";
import { useUserDataContext } from "@/context/UserDataProvider";

// Inline Kommentar: Wir benennen das hier einfach "Page", weil es in /app/... benutzt wird.
export default function Page() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData } = useUserDataContext();

  // Inline Kommentar: Chats werden asynchron geholt
  const chats = useChats({ user });

  // Inline Kommentar: Null bedeutet: aktuell kein aktiver Chat gewählt
  const [chatId, setChatId] = useState<string | null>(null);

  // Inline Kommentar: Falls du dich sofort connecten möchtest
  const [activeSearch, setActiveSearch] = useState<boolean>(false);
  const searchImmediately = userData?.matchSettings?.searchImmediately ?? false;

  // Kategorien-Check
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

  // useMatch-Hook
  useMatch({
    user,
    allCategoriesFilled,
    searchImmediately,
    setChatId,
    setActiveSearch,
  });

  // Inline Kommentar: Wenn Chats da sind und keine chatId gewählt ist,
  // soll automatisch der erste Chat ausgewählt werden.
  useEffect(() => {
    if (!chatId && chats && chats.length > 0) {
      setChatId(chats[0].id);
    }
  }, [chatId, chats]);

  // Memoized Funktion für setChatId
  const handleSetChatId = useCallback((id: string) => {
    setChatId(id);
  }, []);

  // ------------------------------------------------
  // Loading / Auth-Check
  // ------------------------------------------------
  if (loadingAuth || loadingData) {
    return <LoadingIcon />;
  }
  if (!user) {
    return <div>Bitte melde dich an, um dein Dashboard zu sehen.</div>;
  }

  // Inline Kommentar: Falls chats (noch) undefined oder null ist, warten wir
  if (!chats) {
    return <LoadingIcon />;
  }

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      {/* OBERER BEREICH*/}
      <MatchStatus searchImmediately={searchImmediately} />

      {/* MATCHES - EIGENTLICHE CHATS */}
      <DashboardCard className="flex-col bg-white">
        <h2 className="text-xl">Matches</h2>

        <div className="flex flex-1 mt-4">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-green-600">
              <span className="text-black mt-2">Keine Matches vorhanden!</span>
            </div>
          ) : (
            <MatchContainer
              chats={chats}
              selectedChatId={chatId}
              setChatId={handleSetChatId}
            />
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
