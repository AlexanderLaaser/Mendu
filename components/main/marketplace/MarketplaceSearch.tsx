"use client";

import React, { useState, useMemo, useCallback } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import MarketplaceFilter from "./MarketplaceFilter";
import OfferCard from "@/components/elements/cards/OfferCard";
import useOffers from "@/hooks/useOffers";
import { useUserDataContext } from "@/context/UserDataProvider";

export default function MarketplaceSearch() {
  const { userData } = useUserDataContext();
  const role = userData?.role;
  const { Offers, saveOffer, removeOffer } = useOffers();

  const [filters, setFilters] = useState<{
    skills: string[];
    position: string;
    branchen: string[];
  }>({
    skills: [],
    position: "",
    branchen: [],
  });

  // Verwende useCallback, um eine stabile Referenz für handleFilterChange zu gewährleisten
  const handleFilterChange = useCallback(
    (newFilters: {
      skills: string[];
      position: string;
      branchen: string[];
    }) => {
      setFilters(newFilters);
    },
    []
  );

  // Filtern der Offers basierend auf Benutzerrolle und Suchkriterien
  const filteredOffers = useMemo(() => {
    if (!role) return [];

    // Bestimme die Zielrolle basierend auf der aktuellen Rolle
    const targetRole = role === "Insider" ? "Talent" : "Insider";

    return Offers.filter((offer) => {
      // Filtere nach Rolle
      if (offer.userRole !== targetRole) return false;

      // Filtere nach Position
      if (
        filters.position &&
        !offer.position.toLowerCase().includes(filters.position.toLowerCase())
      ) {
        return false;
      }

      // Filtere nach Skills (alle ausgewählten Skills müssen vorhanden sein)
      if (filters.skills.length > 0) {
        const hasAllSkills = filters.skills.every((skill) =>
          offer.skills.includes(skill)
        );
        if (!hasAllSkills) return false;
      }

      // // Filtere nach Branchen (alle ausgewählten Branchen müssen vorhanden sein)
      // if (filters.branchen.length > 0) {
      //   const hasAllBranchen = filters.branchen.every((branche) =>
      //     offer.industries.includes(branche)
      //   );
      //   if (!hasAllBranchen) return false;
      // }

      return true;
    });
  }, [Offers, role, filters]);

  return (
    <div className="flex-1 flex flex-row gap-4">
      <DashboardCard className="basis-1/4 bg-white">
        <MarketplaceFilter onFilterChange={handleFilterChange} />
      </DashboardCard>
      <div className="basis-3/4">
        <DashboardCard className="bg-white">
          <h2 className="text-xl mb-4">Suchergebnisse</h2>
          <div className="flex gap-4 flex-wrap">
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <div key={offer.id} className="w-1/3 min-w-[250px]">
                  <OfferCard
                    offer={offer}
                    onClick={() => {
                      //Implementiere die Bearbeitungslogik, falls notwendig
                    }}
                    onDelete={() => removeOffer(offer.id)}
                    isDisplayedInSearch={true}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Keine passenden Angebote gefunden.
              </p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
