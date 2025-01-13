// components/Match/MatchActions.tsx

"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface MatchActionsProps {
  matchId: string;
  userUid: string; // talent oder insider
  alreadyAccepted: boolean;
  onAfterAction?: (accepted: boolean) => void; // neu: Übergabe, ob akzeptiert oder abgelehnt
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
      if (res.ok && data.success) {
        console.log("Match angenommen");
        // Callback aufrufen und "true" übergeben
        onAfterAction?.(true);
      } else {
        console.error("Fehler bei Match-Annahme:", data);
      }
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accept", {
        // Beispiel-Endpoint /api/accept (oder /api/match/accept, je nach Struktur)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, userUid }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        console.log("Match abgelehnt");
        // Callback aufrufen und "false" übergeben
        onAfterAction?.(false);
      } else {
        console.error("Fehler bei Match-Ablehnung:", data);
      }
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        className="btn btn-success"
        onClick={handleAccept}
        disabled={alreadyAccepted || loading}
      >
        Annehmen
      </Button>
      <Button
        className="btn btn-error"
        onClick={handleDecline}
        disabled={loading}
      >
        Ablehnen
      </Button>
    </div>
  );
};

export default MatchActions;
