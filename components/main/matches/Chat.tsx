"use client";

import React, { useState, useMemo } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import MatchActions from "./MatchActions";
import { useAuth } from "@/context/AuthContext";
import { Match } from "@/models/match";
import { getOppositeRoleName } from "@/utils/helper";
import { useUserDataContext } from "@/context/UserDataContext";
import { User } from "@/models/user";

// CODE-ÄNDERUNG: Import für Update-Funktion in Firestore
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import ChatDetails from "./ChatDetails";

interface ChatProps {
  ChatId: string;
  match: Match;
  partnerData: User;
}

const Chat: React.FC<ChatProps> = ({ ChatId, match, partnerData }) => {
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

  // CODE-ÄNDERUNG: State für "Match bestätigt" Interaktion
  const [matchDecision, setMatchDecision] = useState<
    "pending" | "accepted" | "declined"
  >("pending");

  // CODE-ÄNDERUNG: State für das Auf- und Zuklappen des Detail-Bereiches
  const [showDetails, setShowDetails] = useState(false);

  const handleAfterAction = (accepted: boolean) => {
    setMatchDecision(accepted ? "accepted" : "declined");
  };

  // CODE-ÄNDERUNG: Funktionen zum Updaten des Match-Status
  const updateMatchStatus = async (newStatus: Match["status"]) => {
    if (!match?.id) return;
    try {
      const matchRef = doc(db, "matches", match.id);
      await updateDoc(matchRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      console.log(`Match-Status auf ${newStatus} gesetzt.`);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Match-Status:", error);
    }
  };

  // CODE-ÄNDERUNG: Handler zum Abschließen des Matches
  const handleCloseMatch = async () => {
    await updateMatchStatus("CLOSED");
  };

  // CODE-ÄNDERUNG: Handler zum Abbrechen des Matches
  const handleCancelMatch = async () => {
    await updateMatchStatus("CANCELLED");
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
      <ChatDetails
        match={match}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        onCloseMatch={handleCloseMatch}
        onCancelMatch={handleCancelMatch}
      />

      {/* Nachrichtenliste für den Chat => ChatId */}
      <MessageList chatId={ChatId} partnerData={partnerData} />

      {match.status === "FOUND" && (
        <div className="p-4 text-center text-gray-700 flex flex-col items-center space-y-4">
          {matchCancelledOrExpired ? (
            <div>Das Match ist beendet (abgelaufen oder abgelehnt).</div>
          ) : matchDecision === "declined" ? (
            <div>
              Das Match wurde nicht bestätigt und wird damit geschlossen!
            </div>
          ) : matchDecision === "accepted" || userAlreadyAccepted ? (
            <div>
              Aktuell warten wir auf Feedback vom{" "}
              {getOppositeRoleName(userData?.role)}.
            </div>
          ) : (
            <MatchActions
              matchId={match.id}
              userId={user?.uid ?? ""}
              alreadyAccepted={userAlreadyAccepted}
              onAfterAction={handleAfterAction}
              partnerId={partnerData.uid}
            />
          )}
        </div>
      )}

      {/* MessageInput sperren, wenn Match.status FOUND oder CANCELLED ist. */}
      <MessageInput
        chatId={ChatId}
        isDisabled={match.status === "FOUND" || match.status === "CANCELLED"}
        partnerData={partnerData}
      />
    </div>
  );
};

export default React.memo(Chat);
