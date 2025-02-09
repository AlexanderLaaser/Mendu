"use client";
import React, { useState, useMemo, useCallback } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import OfferCard from "@/components/elements/cards/OfferCard";
import { useUserDataContext } from "@/context/UserDataContext";
import { getOppositeRoleName } from "@/utils/helper";
import { MdWarning } from "react-icons/md";
import useOffers from "@/hooks/useOffers";
import { Offer } from "@/models/offers";
import MarketplaceFilter from "./MarketPlaceFilter";
import { useOfferContext } from "@/context/OfferContext";
import { doc, updateDoc, arrayUnion, getFirestore } from "firebase/firestore";

/** Eine Hilfsfunktion, um ein Offer gegen die Filter zu prüfen. */
function matchesFilter(
  offer: Offer,
  filters: {
    skills: string[];
    positions: string[];
    branchen: string[];
    companies: string[];
  }
): boolean {
  // Position-Filter
  if (filters.positions.length > 0) {
    if (!filters.positions.includes(offer.position)) {
      return false;
    }
  }
  // Skills-Filter
  if (filters.skills.length > 0) {
    const hasAllSkills = filters.skills.every((skill) =>
      offer.skills.includes(skill)
    );
    if (!hasAllSkills) return false;
  }
  // Branchen-Filter
  if (filters.branchen.length > 0) {
    if (!filters.branchen.includes((offer as any).branche)) {
      return false;
    }
  }
  // Firmen-Filter
  if (filters.companies.length > 0) {
    if (!offer.company || !filters.companies.includes(offer.company)) {
      return false;
    }
  }
  return true;
}

export default function MarketplaceSearch() {
  const { userData } = useUserDataContext();
  const role = userData?.role;
  const currentUserId = userData?.uid; // <-- NEU: Aktuelle User-ID

  // Hier laden wir ALLE Offers
  const { allOffers } = useOffers();

  const { userOffers, removeOffer } = useOfferContext();
  const hasUserOffer = userOffers.length > 0;

  // State für die Filter
  const [filters, setFilters] = useState({
    skills: [] as string[],
    positions: [] as string[],
    branchen: [] as string[],
    companies: [] as string[],
  });

  // Filter-Callback
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleRequestReferral = useCallback(
    async (offer: Offer) => {
      if (!currentUserId) return;

      try {
        // 1) Match in /api/marketMatch anlegen
        const payload = {
          currentUserId: currentUserId,
          offerCreatorId: offer.uid,
          role: userData?.role,
          offerData: {
            company: offer.company,
            position: offer.position,
          },
        };

        const res = await fetch("/api/marketMatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!data.success) {
          console.error("Fehler:", data.message);
          return;
        }
        console.log("MatchID:", data.matchId, "ChatID:", data.chatId);

        // 2) Firestore-Dokument updaten: userId in requestedBy array
        const firestore = getFirestore();
        // Aktualisiere das Dokument in der Subcollection "offers" unter "users/{offer.uid}"
        await updateDoc(
          doc(firestore, "users", offer.uid, "offers", offer.id),
          {
            requestedBy: arrayUnion(currentUserId),
          }
        );

        console.log(
          "requestedBy in der Subcollection 'users/{offer.uid}/offers' erfolgreich aktualisiert."
        );
      } catch (err) {
        console.error("Fehler beim Request/Update:", err);
      }
    },
    [currentUserId, userData?.role]
  );

  // Suchergebnisse berechnen
  const searchResultOffers = useMemo(() => {
    if (!role) return [];

    // Rolle (Insider sieht nur Talents, Talent sieht nur Insider)
    const targetRole = role === "Insider" ? "Talent" : "Insider";

    // Wenn keine Filter gesetzt sind, geben wir alle Offers zurück
    const nothingSelected =
      filters.skills.length === 0 &&
      filters.positions.length === 0 &&
      filters.branchen.length === 0 &&
      filters.companies.length === 0;

    if (nothingSelected) {
      return allOffers.filter((offer) => offer.userRole === targetRole);
    }

    return allOffers.filter((offer) => {
      if (offer.userRole !== targetRole) return false;
      return matchesFilter(offer, filters);
    });
  }, [role, filters, allOffers]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Linke Spalte: Filter */}
      <DashboardCard className="w-full md:w-1/4 bg-white">
        <MarketplaceFilter
          onFilterChange={handleFilterChange}
          disabled={!hasUserOffer}
        />
      </DashboardCard>

      {/* Rechte Spalte: Ergebnisse */}
      <div className="w-full md:w-3/4">
        <DashboardCard className="bg-white">
          <h2 className="text-xl mb-4">Suchergebnisse</h2>

          {/* Hinweis, falls User kein eigenes Offer hat */}
          {!hasUserOffer ? (
            <div className="flex flex-col items-center justify-center text-red-600 min-h-[100px]">
              <MdWarning className="text-4xl mb-2" />
              <p className="text-center">
                Bitte lege zuerst mindestens ein Offer an, um die Suche nutzen
                zu können.
              </p>
            </div>
          ) : searchResultOffers.length > 0 ? (
            <div className="flex gap-4 flex-wrap">
              {searchResultOffers.map((offer) => {
                // -- NEU: prüfen, ob aktueller User bereits angefragt hat
                const alreadyRequested =
                  offer.requestedBy?.includes(currentUserId || "") ?? false;

                return (
                  <div key={offer.id} className="w-full sm:w-1/2 md:w-1/3">
                    <OfferCard
                      offer={offer}
                      onClick={() => handleRequestReferral(offer)}
                      onDelete={() => removeOffer(offer.id)}
                      isDisplayedInSearch
                      disabled={alreadyRequested} // <-- NEU
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              Keine passenden {getOppositeRoleName(role)} gefunden.
            </p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
