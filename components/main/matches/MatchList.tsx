"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { Match } from "@/models/match";

interface MatchListProps {
  // <-- Clean Code: Erhalte die Matches als Prop
  matches: Match[];
  // Callback liefert sowohl die Match-ID als auch die zugehörige Chat-ID
  onMatchSelect?: (matchId: string, chatId: string) => void;
  selectedMatchId?: string;
}

const MatchList: React.FC<MatchListProps> = React.memo(
  ({ matches, onMatchSelect, selectedMatchId }) => {
    const { user } = useAuth();
    const currentUserId = user?.uid;

    // Partnerprofile werden weiterhin asynchron geladen
    interface PartnerProfile {
      personalData?: {
        firstName?: string;
      };
      // Add other fields as needed
    }

    const [partnerProfiles, setPartnerProfiles] = useState<
      Record<string, PartnerProfile>
    >({});

    // 1) Partner-Daten laden (basierend auf den übergebenen Matches)
    useEffect(() => {
      if (!matches || !currentUserId) return;

      async function fetchPartnerProfiles() {
        const uniquePartnerIds = new Set<string>();
        for (const match of matches) {
          const partnerId =
            match.talentUid === currentUserId
              ? match.insiderUid
              : match.talentUid;

          if (partnerId) uniquePartnerIds.add(partnerId);
        }

        const fetchedData: Record<string, PartnerProfile> = {};
        for (const partnerId of uniquePartnerIds) {
          try {
            const docRef = doc(db, "users", partnerId);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              fetchedData[partnerId] = snap.data();
            }
          } catch (error) {
            console.error("Fehler beim Laden der Partner-Daten:", error);
          }
        }

        setPartnerProfiles(fetchedData);
      }

      fetchPartnerProfiles();
    }, [matches, currentUserId]);

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

    const getMatchPercentage = (): number => {
      return 95; // Dummy-Wert als Platzhalter
    };

    return (
      <div className="h-full overflow-y-auto text-sm">
        <ul>
          {matches.map((match) => {
            const partnerId =
              match.talentUid === currentUserId
                ? match.insiderUid
                : match.talentUid;

            // Partnerdaten aus dem Cache
            const partnerData = partnerId ? partnerProfiles[partnerId] : null;
            const partnerName =
              partnerData?.personalData?.firstName || "Partner";

            const matchPercentage = getMatchPercentage();
            const createdTime = match.createdAt
              ? getCreatedTime(match.createdAt)
              : "";
            const isSelected = match.id === selectedMatchId;

            return (
              <li
                key={match.id}
                onClick={
                  () => onMatchSelect?.(match.id, match.chatId) // <-- Clean Code: Übergabe von Match-ID und zugehöriger Chat-ID
                }
                className={`relative cursor-pointer hover:bg-gray-100 hover:rounded-lg p-4 mr-4 mb-4 border-b last:border-b-0 border-gray-200 ${
                  isSelected ? "bg-primary/10 rounded-lg" : ""
                }`}
              >
                {/* Match-Typ-Anzeige */}
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

                {/* Status (z. B. FOUND, CONFIRMED, CANCELLED etc.) */}
                <div className="text-sm text-gray-600">
                  Status: {match.status}
                </div>

                {/* Match-Prozentanzeige */}
                <span className="absolute top-2 right-2 bg-green-100 text-green-600 text-xs px-1 py-0.5 rounded">
                  {matchPercentage}%
                </span>

                {/* Datum */}
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
