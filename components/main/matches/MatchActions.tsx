"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineDoNotDisturbOn } from "react-icons/md";

interface MatchActionsProps {
  matchId: string;
  userUid: string; // talent oder insider
  alreadyAccepted: boolean;
  onAfterAction?: (accepted: boolean) => void;
}

const MatchActions: React.FC<MatchActionsProps> = ({
  matchId,
  userUid,
  alreadyAccepted,
  onAfterAction,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/acceptMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, userUid }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Fehler bei Match-Annahme:", data);
        return;
      } else console.log("Match angenommen");
      onAfterAction?.(true);
    } catch (error) {
      console.error("Fehler bei Match-Annahme:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/declineMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, userUid }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Fehler bei Match-Ablehnung:", data);
        return;
      }

      console.log("Match abgelehnt");
      onAfterAction?.(false);
    } catch (error) {
      console.error("Fehler bei Match-Ablehnung:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="success"
        onClick={handleAccept}
        disabled={alreadyAccepted || loading}
      >
        <FaCheckCircle />
        Annehmen
      </Button>
      <Button variant="destructive" onClick={handleDecline} disabled={loading}>
        <MdOutlineDoNotDisturbOn />
        Ablehnen
      </Button>
    </div>
  );
};

export default React.memo(MatchActions);
