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

// Definiere einen Typ für die Filter
interface Filter {
  skills: string[];
  positions: string[];
  branchen: string[];
  companies: string[];
}

/** Prüft, ob ein Offer mit den derzeitigen Filterkriterien übereinstimmt. */
function matchesFilter(offer: Offer, filters: Filter): boolean {
  // Positions-Filter
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
  const currentUserId = userData?.uid;

  // Hole alle Offers aus dem Hook
  const { allOffers, setAllOffers } = useOffers();
  console.log("allOffers", allOffers);

  const { userOffers, removeOffer } = useOfferContext();
  const hasUserOffer = userOffers.length > 0;

  // Setze den Filter-State mit expliziter Typisierung
  const [filters, setFilters] = useState<Filter>({
    skills: [],
    positions: [],
    branchen: [],
    companies: [],
  });

  // Callback, um Filter zu setzen
  const handleFilterChange = useCallback((newFilters: Filter) => {
    setFilters(newFilters);
  }, []);

  // Klick auf "Request Referral"
  const handleRequestReferral = useCallback(
    async (offer: Offer) => {
      if (!currentUserId) return;

      try {
        // 1) Eintrag in /api/marketMatch anlegen (Match starten)
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

        // 2) Firestore-Dokument updaten: currentUserId in requestedBy eintragen
        const firestore = getFirestore();
        await updateDoc(doc(firestore, "offers", offer.id), {
          requestedBy: arrayUnion(currentUserId),
        });

        // Lokales Update, um Offer sofort zu disablen
        setAllOffers((prevOffers) =>
          prevOffers.map((o) =>
            o.id === offer.id
              ? { ...o, requestedBy: [...(o.requestedBy || []), currentUserId] }
              : o
          )
        );
      } catch (err) {
        console.error("Fehler beim Request/Update:", err);
      }
    },
    [currentUserId, userData?.role, setAllOffers]
  );

  // Filterung der Offers
  const searchResultOffers = useMemo(() => {
    if (!role) return [];

    // Rolle: Insider sieht nur Talents, Talent sieht nur Insider
    const targetRole = role === "Insider" ? "Talent" : "Insider";

    // Wenn keine Filter gesetzt sind -> alles anzeigen (nur nach Rolle gefiltert)
    const noFiltersSet =
      filters.skills.length === 0 &&
      filters.positions.length === 0 &&
      filters.companies.length === 0;

    if (noFiltersSet) {
      return allOffers.filter((offer) => offer.userRole === targetRole);
    }

    // Ansonsten nach Rolle und Filter (matchesFilter) filtern
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

          {/* Hinweis, falls User kein eigenes Offer angelegt hat */}
          {!hasUserOffer ? (
            <div className="flex flex-col items-center justify-center text-red-600 min-h-[100px]">
              <MdWarning className="text-4xl mb-2" />
              <p className="text-center">
                Bitte lege zuerst mindestens ein Offer an, um die Suche nutzen
                zu können.
              </p>
            </div>
          ) : searchResultOffers.length > 0 ? (
            /* CODE-ÄNDERUNG: Statt flex-wrap ein Grid für responsives Layout */
            <div
              className="
                grid 
                grid-cols-1 
                sm:grid-cols-1 
                md:grid-cols-2 
                xl:grid-cols-3
                gap-4
              "
            >
              {searchResultOffers.map((offer) => {
                // Prüfen, ob bereits angefragt wurde
                const alreadyRequested =
                  offer.requestedBy?.includes(currentUserId || "") ?? false;

                return (
                  /* CODE-ÄNDERUNG: Entfernt Breiten-Angaben, Grid steuert Spaltenbreiten */
                  <div key={offer.id}>
                    <OfferCard
                      offer={offer}
                      onClick={() => handleRequestReferral(offer)}
                      onDelete={() => removeOffer(offer.id)}
                      isDisplayedInSearch
                      disabled={alreadyRequested}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              Keine passenden {getOppositeRoleName(role ?? "Insider")} gefunden.
            </p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
