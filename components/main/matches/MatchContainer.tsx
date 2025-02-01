"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import MatchList from "./MatchList";
import Chat from "./Chat";
import { Match } from "@/models/match";

interface MatchContainerProps {
  // <-- Clean Code: "matches" werden als Prop übergeben (statt "chats")
  matches: Match[];
  defaultMatchId?: string;
  chatId: string | null; // aktuelle Chat-ID
  setChatId: (id: string | null) => void; // Funktion zum Setzen der Chat-ID
}

const MatchContainer: React.FC<MatchContainerProps> = React.memo(
  ({ matches, defaultMatchId, setChatId }) => {
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
      defaultMatchId ?? null
    );

    // Falls noch kein Match ausgewählt ist, wähle automatisch das erste aus
    useEffect(() => {
      if (!selectedMatchId && matches.length > 0) {
        setSelectedMatchId(matches[0].id); //
        setChatId(matches[0].chatId); //
      }
    }, [matches, selectedMatchId, setChatId]);

    // Ermittele den aktiven Match anhand der ausgewählten Match-ID
    const activeMatch = useMemo(() => {
      if (!selectedMatchId) return null;
      return matches.find((match) => match.id === selectedMatchId) || null;
    }, [matches, selectedMatchId]);

    // Extrahiere aus dem aktiven Match die relevanten Daten
    const activeChatId = activeMatch?.chatId ?? null; // <-- Annahme: match.chatId existiert
    // TODO! Annahme: match.locked existiert
    const matchStatus = activeMatch?.status ?? false; // <-- Falls "locked" ein Feld in Match ist
    const matchId = activeMatch?.id ?? null;

    return (
      <DashboardCard className="flex-col bg-white p-0">
        <div className="flex flex-1 mt-4">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-green-600">
              <span className="text-black mt-2">Keine Matches vorhanden!</span>
            </div>
          ) : (
            <>
              <div className="w-1/2 border-r border-gray-300">
                {/* <-- Clean Code: Übergabe der Matches und Callback zur Match-Auswahl */}
                <MatchList
                  matches={matches}
                  onMatchSelect={(matchId, newChatId) => {
                    setSelectedMatchId(matchId);
                    setChatId(newChatId);
                  }}
                  selectedMatchId={selectedMatchId ?? undefined}
                />
              </div>
              <div className="w-2/3 flex flex-col">
                {selectedMatchId && activeChatId ? (
                  <Chat
                    ChatId={activeChatId}
                    matchId={matchId}
                    // TODO! Annahme: match.locked existiert
                    matchStatus={matchStatus}
                  />
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    Wähle ein Match aus der Liste.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardCard>
    );
  }
);

MatchContainer.displayName = "MatchContainer";

export default MatchContainer;
