"use client";

import React, { useState, useMemo, useCallback } from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import MarketplaceFilter from "./MarketplaceFilter";
import OfferCard from "@/components/elements/cards/OfferCard";
import useOffers from "@/hooks/useOffers";
import { useUserDataContext } from "@/context/UserDataContext";
import { getOppositeRoleName } from "@/utils/helper";

export default function MarketplaceSearch() {
  const { userData } = useUserDataContext();
  const role = userData?.role;
  const { Offers, removeOffer } = useOffers();

  // Filter-State mit Firmen
  const [filters, setFilters] = useState<{
    skills: string[];
    position: string;
    branchen: string[];
    companies: string[];
  }>({
    skills: [],
    position: "",
    branchen: [],
    companies: [],
  });

  // Verwende useCallback für stabile Referenz
  const handleFilterChange = useCallback(
    (newFilters: {
      skills: string[];
      position: string;
      branchen: string[];
      companies: string[];
    }) => {
      setFilters(newFilters);
    },
    []
  );

  const filteredOffers = useMemo(() => {
    if (!role) return [];

    const noFilterSelected =
      filters.skills.length === 0 &&
      !filters.position &&
      filters.branchen.length === 0 &&
      filters.companies.length === 0;

    if (noFilterSelected) {
      return [];
    }

    const targetRole = role === "Insider" ? "Talent" : "Insider";

    return Offers.filter((offer) => {
      // Filter nach Rolle
      if (offer.userRole !== targetRole) return false;

      // Filter nach Position
      if (
        filters.position &&
        !offer.position.toLowerCase().includes(filters.position.toLowerCase())
      ) {
        return false;
      }

      // Filter nach Skills
      if (filters.skills.length > 0) {
        const hasAllSkills = filters.skills.every((skill) =>
          offer.skills.includes(skill)
        );
        if (!hasAllSkills) return false;
      }

      // Filter nach Firmen (falls Filter gesetzt und Rolle passt)
      if (filters.companies.length > 0) {
        // Nehme an, dass offer.company vorhanden ist und Firmenname enthält.
        if (!offer.company || !filters.companies.includes(offer.company)) {
          return false;
        }
      }

      if (filters.branchen.length > 0) {
        const hasAllBranchen = filters.branchen.every((b) =>
          offer.industries.includes(b)
        );
        if (!hasAllBranchen) return false;
      }

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
                      // ggf. Bearbeitungslogik
                    }}
                    onDelete={() => removeOffer(offer.id)}
                    isDisplayedInSearch
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Keine passenden {getOppositeRoleName(role)} gefunden.
              </p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
