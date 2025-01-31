"use client";

import React, { useState, useEffect, useMemo } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/context/AuthContext";
import MatchActions from "./MatchActions";
import { Match } from "@/models/match";
import { getOppositeRoleName } from "@/utils/helper";
import { useUserDataContext } from "@/context/UserDataProvider";

// Cache-Objekt für matchData
const matchDataCache: { [key: string]: Match } = {};

interface ChatProps {
  ChatId: string; // Die ID des "chats" Dokuments
  matchId: string; // Die ID des "matches" Dokuments
  chatLocked: boolean;
}

const Chat: React.FC<ChatProps> = ({ ChatId, matchId, chatLocked }) => {
  const { user } = useAuth();
  const { userData } = useUserDataContext();

  const [isLoading, setIsLoading] = useState(true);
  const [matchData, setMatchData] = useState<Match | null>(null);

  useEffect(() => {
    async function loadMatchData() {
      setIsLoading(true);
      // Inline Kommentar: Falls wir matchData schon im Cache haben
      if (matchDataCache[matchId]) {
        setMatchData(matchDataCache[matchId]);
        setIsLoading(false);
      } else {
        try {
          const res = await fetch(`/api/matches/${matchId}`);
          if (!res.ok) {
            throw new Error(`HTTP-Fehler! Status: ${res.status}`);
          }
          const data: Match = await res.json();
          matchDataCache[matchId] = data; // Daten in den Cache legen
          setMatchData(data);
        } catch (error) {
          console.error("Fehler beim Laden des Match:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    // Nur laden, wenn wirklich ein matchId existiert
    if (matchId) {
      loadMatchData();
    }
  }, [matchId]);

  // Check, ob aktueller User bereits bestätigt hat
  const userAlreadyAccepted = useMemo(() => {
    if (!matchData || !user) return false;
    if (user.uid === matchData.talentUid) {
      return matchData.talentAccepted || false;
    } else if (user.uid === matchData.insiderUid) {
      return matchData.insiderAccepted || false;
    }
    return false;
  }, [matchData, user]);

  // Check, ob das Match bereits abgelehnt oder abgelaufen ist
  const matchCancelledOrExpired = useMemo(() => {
    if (!matchData) return false;
    return ["CANCELLED", "EXPIRED"].includes(matchData.status);
  }, [matchData]);

  const [matchDecision, setMatchDecision] = useState<
    "pending" | "accepted" | "declined"
  >("pending");

  const handleAfterAction = (accepted: boolean) => {
    setMatchDecision(accepted ? "accepted" : "declined");
  };

  // Falls Match-Daten noch geladen werden
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="w-2/3 max-w-md">
          <div className="mb-2 text-center text-gray-500">Lade Daten ...</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Falls kein Match gefunden
  if (!matchData) {
    return (
      <div className="p-4 text-center text-gray-700">
        Keine Match-Daten gefunden.
      </div>
    );
  }

  // Inline Kommentar: An dieser Stelle entfernen wir die bisherige "if-else"-Bedingung.
  // Stattdessen zeigen wir immer die MessageInput-Komponente an
  // und steuern, ob sie deaktiviert ist, mithilfe von "chatLocked" oder eigener Logik.

  return (
    <div className="flex flex-col h-full">
      {/* Nachrichtenliste für den Chat => ChatId */}
      <MessageList chatId={ChatId} />

      {/* Inline Kommentar: Dieser Bereich wird NUR angezeigt, wenn chatLocked true ist. 
          Er zeigt z.B. MatchActions, falls der User sich noch entscheiden muss. */}
      {chatLocked && (
        <div className="p-4 text-center text-gray-700 flex flex-col items-center space-y-4">
          {matchCancelledOrExpired ? (
            <div>Das Match ist beendet (abgelaufen oder abgelehnt).</div>
          ) : matchDecision === "declined" ? (
            <div>Du hast das Match abgelehnt.</div>
          ) : matchDecision === "accepted" || userAlreadyAccepted ? (
            <div>
              Aktuell warten wir auf Feedback vom{" "}
              {getOppositeRoleName(userData?.role)}.
            </div>
          ) : (
            <MatchActions
              matchId={matchId}
              userUid={user?.uid ?? ""}
              alreadyAccepted={userAlreadyAccepted}
              onAfterAction={handleAfterAction}
            />
          )}
        </div>
      )}
      <MessageInput chatId={ChatId} isDisabled={chatLocked} />
    </div>
  );
};

export default React.memo(Chat);
