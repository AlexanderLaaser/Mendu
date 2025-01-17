"use client";

import React, { useState, useEffect, useMemo } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/context/AuthContext";
import MatchActions from "./MatchActions";
import { Match } from "@/models/match";

interface ChatProps {
  ChatId: string | null;
  matchId: string;
  chatLocked: boolean;
}

const Chat: React.FC<ChatProps> = ({ ChatId, matchId, chatLocked }) => {
  const { user } = useAuth();

  const [matchData, setMatchData] = useState<Match | null>(null);

  // NEU: Loading-State für das Laden der Match-Daten
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMatchData() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        const data = await res.json();
        setMatchData(data);
      } catch (error) {
        console.error("Fehler beim Laden des Match:", error);
      } finally {
        // Egal ob erfolgreich oder nicht, wir haben den Ladevorgang beendet
        setIsLoading(false);
      }
    }
    if (matchId) {
      loadMatchData();
    }
  }, [matchId]);

  // Genauso wie vorher:
  const userAlreadyAccepted = useMemo(() => {
    if (!matchData || !user) return false;
    if (user.uid === matchData.talentUid) {
      return matchData.talentAccepted || false;
    } else if (user.uid === matchData.insiderUid) {
      return matchData.insiderAccepted || false;
    }
    return false;
  }, [matchData, user]);

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

  // NEU: Loading-Anzeige, solange wir die Match-Daten laden.
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-700">
        Daten werden geladen ...
      </div>
    );
  }

  // Sobald Daten geladen: Normale UI
  return (
    <div className="flex flex-col h-full">
      <MessageList chatId={ChatId} />

      {chatLocked ? (
        <div className="p-4 text-center text-gray-700 flex flex-col items-center space-y-4">
          {matchCancelledOrExpired ? (
            <div>Das Match ist beendet (abgelaufen oder abgelehnt).</div>
          ) : matchDecision === "declined" ? (
            <div>Du hast das Match abgelehnt.</div>
          ) : matchDecision === "accepted" || userAlreadyAccepted ? (
            <div>Aktuell warten wir auf Feedback vom Talent.</div>
          ) : (
            <MatchActions
              matchId={matchId}
              userUid={user?.uid ?? ""}
              alreadyAccepted={userAlreadyAccepted}
              onAfterAction={handleAfterAction}
            />
          )}
        </div>
      ) : (
        <MessageInput chatId={ChatId} />
      )}
    </div>
  );
};

export default Chat;
