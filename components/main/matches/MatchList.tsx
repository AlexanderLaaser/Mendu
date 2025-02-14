"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Timestamp } from "firebase/firestore";
import { Match } from "@/models/match";
import { User } from "@/models/user";

interface MatchListProps {
  matches: Match[];
  onMatchSelect?: (matchId: string, chatId: string) => void;
  selectedMatchId?: string;
  partnerData: User; // CODE-ÄNDERUNG: Du könntest hier ggf. ein Record<string,User> verwenden
}

const MatchList: React.FC<MatchListProps> = React.memo(
  ({ matches, onMatchSelect, selectedMatchId, partnerData }) => {
    // Hilfsfunktion zur Formatierung des Timestamps
    const getCreatedTime = (timestamp: Timestamp): string => {
      let dateObj: Date;
      if (timestamp && typeof timestamp.toDate === "function") {
        dateObj = timestamp.toDate();
      } else if (timestamp && timestamp.seconds) {
        dateObj = new Date(timestamp.seconds * 1000);
      } else {
        return "";
      }
      return format(dateObj, "dd-MM-yyyy HH:mm");
    };

    // CODE-ÄNDERUNG: Neue Hilfsfunktion zur Übersetzung des Status
    const translateStatus = (status: Match["status"]): string => {
      switch (status) {
        case "FOUND":
          return "Gefunden";
        case "CONFIRMED":
          return "Bestätigt";
        case "CANCELLED":
          return "Abgesagt";
        case "EXPIRED":
          return "Abgelaufen";
        case "CLOSED":
          return "Abgeschlossen";
        default:
          return status; // Falls neue Statuswerte hinzugefügt werden, fallback auf Original
      }
    };

    // Anpassung: Matches nach createdAt absteigend sortieren, sodass der neuste Chat oben ist
    const sortedMatches = useMemo(() => {
      return matches.slice().sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.toDate().getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
    }, [matches]);

    const containerRef = useRef<HTMLDivElement>(null);

    // CODE-ÄNDERUNG: Automatisches Scrollen zum Anfang, wenn sich die Matches ändern
    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }, [sortedMatches]);

    return (
      <div ref={containerRef} className="max-h-[500px] overflow-y-auto text-sm">
        <ul>
          {sortedMatches.map((match) => {
            const partnerName = partnerData.personalData.firstName || "Partner";

            const createdTime = match.createdAt
              ? getCreatedTime(match.createdAt)
              : "";
            const isSelected = match.id === selectedMatchId;

            return (
              <li
                key={match.id}
                onClick={() => onMatchSelect?.(match.id, match.chatId)}
                className={`relative cursor-pointer hover:bg-gray-100 hover:rounded-lg p-4 mr-4 mb-4 border-b last:border-b-0 border-gray-200 ${
                  isSelected ? "bg-primary/10 rounded-lg" : ""
                }`}
              >
                {/* Match-Typ-Anzeige (DIRECT oder MARKETPLACE) */}
                <div className="absolute bottom-2 right-2 text-green-600 text-xs px-1 py-0.5 rounded">
                  <Badge>{match.type || "Unbekannt"}</Badge>
                </div>

                {/* Partner-Name statt eigenem Namen */}
                <div className="text-black text-sm font-semibold">
                  {partnerName}{" "}
                  {match.matchParameters.company && (
                    <span className="text-black">
                      ({match.matchParameters.company})
                    </span>
                  )}
                </div>

                {match.type !== "MARKETPLACE" && (
                  <span className="absolute top-2 right-2 bg-green-100 text-green-600 text-xs px-1 py-0.5 rounded">
                    {match.matchFactor}%
                  </span>
                )}

                {/* CODE-ÄNDERUNG: Statusübersetzung */}
                <div className="text-sm text-gray-600">
                  Status: {translateStatus(match.status)}
                </div>

                {/* Erstellungsdatum */}
                <div className="pt-2">
                  {createdTime && (
                    <span className="text-xs text-gray-500">{createdTime}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
);

MatchList.displayName = "MatchList";

export default MatchList;
