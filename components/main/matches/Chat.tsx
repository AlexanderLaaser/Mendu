"use client";

import React, { useState, useMemo } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/context/AuthContext";
import MatchActions from "./MatchActions";
import { Match } from "@/models/match";
import { getOppositeRoleName } from "@/utils/helper";
import { useUserDataContext } from "@/context/UserDataContext";

interface ChatProps {
  ChatId: string;
  match: Match;
}

const Chat: React.FC<ChatProps> = ({ ChatId, match }) => {
  const { user } = useAuth();
  const { userData } = useUserDataContext();

  // Check, ob aktueller User bereits bestätigt hat
  const userAlreadyAccepted = useMemo(() => {
    if (!match || !user) return false;
    if (user.uid === match.talentUid) {
      return match.talentAccepted || false;
    } else if (user.uid === match.insiderUid) {
      return match.insiderAccepted || false;
    }
    return false;
  }, [match, user]);

  // Check, ob das Match bereits abgelehnt oder abgelaufen ist
  const matchCancelledOrExpired = useMemo(() => {
    if (!match) return false;
    return ["CANCELLED", "EXPIRED"].includes(match.status);
  }, [match]);

  const [matchDecision, setMatchDecision] = useState<
    "pending" | "accepted" | "declined"
  >("pending");

  const handleAfterAction = (accepted: boolean) => {
    setMatchDecision(accepted ? "accepted" : "declined");
  };
  if (!match) {
    return (
      <div className="p-4 text-center text-gray-700">
        Keine Match-Daten gefunden.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Nachrichtenliste für den Chat => ChatId */}
      <MessageList chatId={ChatId} />

      {/*  Dieser Bereich wird NUR angezeigt, wenn chatLocked true ist. 
          Er zeigt z.B. MatchActions, falls der User sich noch entscheiden muss. */}
      {match.status === "FOUND" && (
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
              matchId={match.id}
              userUid={user?.uid ?? ""}
              alreadyAccepted={userAlreadyAccepted}
              onAfterAction={handleAfterAction}
            />
          )}
        </div>
      )}
      <MessageInput chatId={ChatId} isDisabled={match.status === "FOUND"} />
    </div>
  );
};

export default React.memo(Chat);
