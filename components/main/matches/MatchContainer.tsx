"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import MatchList from "./MatchList";
import Chat from "./Chat";
import { Match } from "@/models/match";
import { useUserDataContext } from "@/context/UserDataContext";
import { useUserDataById } from "@/hooks/useUserDataById";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface MatchContainerProps {
  matches: Match[];
  defaultMatchId: string;
  chatId: string | null;
  setChatId: (id: string | null) => void;
}

const MatchContainer: React.FC<MatchContainerProps> = React.memo(
  ({ matches, defaultMatchId, setChatId }) => {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(
      defaultMatchId ?? null
    );

    const { userData } = useUserDataContext();
    const currentUserId = userData?.uid;

    // Gefilterte Matches
    const filteredMatches = useMemo(() => {
      return matches.filter((match) => {
        const statusOk =
          statusFilter === "ALL" ? true : match.status === statusFilter;
        const typeOk = typeFilter === "ALL" ? true : match.type === typeFilter;
        return statusOk && typeOk;
      });
    }, [matches, statusFilter, typeFilter]);

    // Partner-ID ermitteln
    const partnerId = useMemo(() => {
      const activeMatch = matches.find((m) => m.id === selectedMatchId);
      if (!activeMatch || !currentUserId) return "";
      return activeMatch.talentUid === currentUserId
        ? activeMatch.insiderUid
        : activeMatch.talentUid;
    }, [matches, selectedMatchId, currentUserId]);

    // Partner-Daten laden
    const partnerData = useUserDataById(partnerId);

    // Fallback: erstes Match auswählen
    useEffect(() => {
      if (!selectedMatchId && filteredMatches.length > 0) {
        setSelectedMatchId(filteredMatches[0].id);
        setChatId(filteredMatches[0].chatId ?? null);
      }
    }, [filteredMatches, selectedMatchId, setChatId]);

    // Aktives Match
    const activeMatch = useMemo(() => {
      if (!selectedMatchId) return null;
      return filteredMatches.find((m) => m.id === selectedMatchId) || null;
    }, [filteredMatches, selectedMatchId]);

    // Chat-ID aus dem aktiven Match
    const activeChatId = activeMatch?.chatId ?? null;

    return (
      <DashboardCard className="flex-col bg-white p-0 w-full">
        {/* Filter: Status & Type */}
        <div className="pb-4 flex flex-wrap gap-4 border-b border-gray-200 p-4">
          <div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full">
                {statusFilter !== "ALL" ? statusFilter : "Status filtern"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Status</SelectItem>
                <SelectItem value="FOUND">FOUND</SelectItem>
                <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                <SelectItem value="EXPIRED">EXPIRED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value)}
            >
              <SelectTrigger className="w-full">
                {typeFilter !== "ALL" ? typeFilter : "Type filtern"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Types</SelectItem>
                <SelectItem value="DIRECT">DIRECT</SelectItem>
                <SelectItem value="MARKETPLACE">MARKETPLACE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CODE-ÄNDERUNG: 
            1) Flex-Container aufspalten in flex-col und ab md:flex-row 
            2) Spaltenbreiten nur ab md festlegen
         */}
        <div
          className="flex flex-col md:flex-row flex-1 mt-4"
          // Inline Kommentar: mobil untereinander, ab md nebeneinander
        >
          {filteredMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-green-600">
              <span className="text-black mt-2">Keine Matches vorhanden!</span>
            </div>
          ) : (
            <>
              <div
                className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-300"
                // Inline Kommentar: mobil 100%, ab md 1/3.
                // Border unten nur mobil, ab md seitliche Trennung
              >
                <MatchList
                  matches={filteredMatches}
                  partnerData={partnerData.userData}
                  onMatchSelect={(matchId, newChatId) => {
                    setSelectedMatchId(matchId);
                    setChatId(newChatId);
                  }}
                  selectedMatchId={selectedMatchId ?? undefined}
                />
              </div>

              <div
                className="w-full md:w-2/3 flex flex-col"
                // Inline Kommentar: mobil 100%, ab md 2/3
              >
                {selectedMatchId && activeChatId ? (
                  <Chat
                    key={activeChatId}
                    ChatId={activeChatId}
                    match={activeMatch}
                    partnerData={partnerData.userData}
                  />
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    Wähle ein Match aus der Liste.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardCard>
    );
  }
);

MatchContainer.displayName = "MatchContainer";
export default MatchContainer;
