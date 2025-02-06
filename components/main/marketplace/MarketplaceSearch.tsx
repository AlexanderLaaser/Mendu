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

  // 1) Filterzustand
  const [filters, setFilters] = useState({
    skills: [] as string[],
    position: "",
    branchen: [] as string[],
    companies: [] as string[],
  });

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // 2) Gefilterte Offers berechnen
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
      // Rolle filtern
      if (offer.userRole !== targetRole) return false;

      // Position
      if (
        filters.position &&
        !offer.position.toLowerCase().includes(filters.position.toLowerCase())
      ) {
        return false;
      }

      // Skills
      if (filters.skills.length > 0) {
        const hasAllSkills = filters.skills.every((skill) =>
          offer.skills.includes(skill)
        );
        if (!hasAllSkills) return false;
      }

      // Firmen
      if (filters.companies.length > 0) {
        if (!offer.company || !filters.companies.includes(offer.company)) {
          return false;
        }
      }

      // Branchen
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
    // CODE-ÄNDERUNG: flex-col auf kleineren Bildschirmen, ab md flex-row
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Filter-Sidebar */}
      <DashboardCard className="w-full md:w-1/4 bg-white">
        <MarketplaceFilter onFilterChange={handleFilterChange} />
      </DashboardCard>

      {/* Suchergebnisse */}
      <div className="w-full md:w-3/4">
        <DashboardCard className="bg-white">
          <h2 className="text-xl mb-4">Suchergebnisse</h2>

          <div className="flex gap-4 flex-wrap">
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                // CODE-ÄNDERUNG: mobil w-full, ab sm => w-1/2, ab md => w-1/3
                <div
                  key={offer.id}
                  className="
                    w-full 
                    sm:w-1/2 
                    md:w-1/3 
                    min-w-[250px]
                  "
                >
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
