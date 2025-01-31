"use client"; // Inline Kommentar: NEU

import React, { useState, useMemo } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import MatchList from "./MatchList";
import Chat from "./Chat";
import { Chat as ChatType } from "@/models/chat";

interface MatchContainerProps {
  chats: ChatType[];
  defaultMatchId?: string;
}

const MatchContainer: React.FC<MatchContainerProps> = React.memo(
  ({ chats, defaultMatchId }) => {
    // Neuer State für ausgewähltes Match
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
      defaultMatchId ?? null
    );

    // Finde den zur ausgewählten MatchId passenden Chat:
    // Bei Performance-Bedenken => useMemo
    const activeChat = useMemo(() => {
      if (!selectedMatchId) return null;
      return chats.find((chat) => chat.matchId === selectedMatchId) || null;
    }, [chats, selectedMatchId]);

    // ChatId = activeChat?.id.
    // locked und matchId ebenso aus dem Chat-Objekt.
    const chatId = activeChat?.id ?? null;
    const chatLocked = activeChat?.locked ?? true;
    const matchId = activeChat?.matchId ?? null;

    // Debug: zur Übersicht
    console.log(
      "Selected matchId:",
      selectedMatchId,
      "| Active chatId:",
      chatId
    );

    return (
      <DashboardCard className="flex-col bg-white p-0">
        <div className="flex flex-1 mt-4">
          {/* Kein Chat, wenn kein matchId gesetzt */}
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-green-600">
              <span className="text-black mt-2">Keine Matches vorhanden!</span>
            </div>
          ) : (
            <>
              <div className="w-1/2 border-r border-gray-300">
                {/* 
                  MatchList soll uns die matchId liefern, 
                  damit wir das im Container über selectedMatchId steuern können 
                */}
                <MatchList
                  onMatchSelect={(matchId) => setSelectedMatchId(matchId)}
                  selectedMatchId={selectedMatchId ?? undefined}
                />
              </div>
              <div className="w-2/3 flex flex-col">
                {selectedMatchId && chatId ? (
                  <Chat
                    ChatId={chatId}
                    matchId={matchId}
                    chatLocked={chatLocked}
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

export default MatchContainer;
