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
  participantName: string;
}

const Chat: React.FC<ChatProps> = ({
  ChatId,
  matchId,
  chatLocked,
  participantName,
}) => {
  const { user } = useAuth();

  // Hier laden wir die Match-Daten aus dem Backend
  const [matchData, setMatchData] = useState<Match | null>(null);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        const data = await res.json();
        setMatchData(data);
      } catch (err) {
        console.error("Fehler beim Laden des Match:", err);
      }
    }
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  // Jetzt berechnen wir, ob der aktuelle User (Talent oder Insider) schon akzeptiert hat
  const userAlreadyAccepted = useMemo(() => {
    if (!matchData) return false;

    if (user?.uid === matchData?.talentUid) {
      return matchData.talentAccepted || false;
    } else if (user?.uid === matchData.insiderUid) {
      return matchData.insiderAccepted || false;
    }
    // Falls was anderes, z. B. Admin etc...
    return false;
  }, [matchData, user]);

  // Oder ob das Match schon in einem End-Status ist
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

  return (
    <div className="flex flex-col h-full">
      <MessageList chatId={ChatId} participantName={participantName} />

      {chatLocked ? (
        <div className="p-4 text-center text-gray-700 flex flex-col items-center space-y-4">
          {matchCancelledOrExpired ? (
            <div>Das Match ist beendet (abgelaufen oder abgelehnt).</div>
          ) : userAlreadyAccepted ? (
            <div>Aktuell warten wir auf Feedback vom Talent.</div>
          ) : matchDecision === "declined" ? (
            <div>Du hast das Match abgelehnt.</div>
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
