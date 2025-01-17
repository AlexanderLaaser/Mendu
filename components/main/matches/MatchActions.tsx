"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";

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
      const res = await fetch("/api/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, userUid }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Fehler bei Match-Annahme:", data);
        return;
      }
      console.log("Match angenommen");
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
      const res = await fetch("/api/decline", {
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
        Annehmen
      </Button>
      <Button variant="destructive" onClick={handleDecline} disabled={loading}>
        Ablehnen
      </Button>
    </div>
  );
};

export default MatchActions;
