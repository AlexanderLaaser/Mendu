"use client";

import React from "react";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import MarketPlaceFilter from "./MarketPlaceFilter";

export default function MarketplaceSearch() {
  // Beispielhaftes JobOffer, um den Standardwert für Position zu setzen
  const exampleJobOffer = {
    company: "Beispiel GmbH",
    position: "Softwareentwickler",
    description: "Beispielbeschreibung",
    referralLink: "https://beispiel.link",
  };

  const handleFilterChange = (filters: {
    skills: string[];
    position: string;
  }) => {
    console.log("Aktuelle Filter:", filters);
    // Hier können Filteranpassungen verarbeitet werden
  };

  return (
    <div className="flex-1 flex-row gap-4">
      {/* Hauptbereich für Marktplatzeinträge */}
      <DashboardCard className="bg-white">
        <h2 className="text-xl mb-4">Marktplatz</h2>
        <div className="flex gap-4">
          <div className="flex gap-4">
            {/* Filterbereich auf der linken Seite */}
            <MarketPlaceFilter
              jobOffer={exampleJobOffer}
              onFilterChange={handleFilterChange}
            />
          </div>
          <div>Hallo</div>
        </div>
      </DashboardCard>
      <DashboardCard className="bg-white">
        <h2 className="text-xl mb-4">Marktplatz</h2>
        <div className="flex gap-4">
          <div className="flex gap-4">
            {/* Filterbereich auf der linken Seite */}
            <MarketPlaceFilter
              jobOffer={exampleJobOffer}
              onFilterChange={handleFilterChange}
            />
          </div>
          <div>Hallo</div>
        </div>
      </DashboardCard>
    </div>
  );
}

//todo: Layout anpassen für die Suche
