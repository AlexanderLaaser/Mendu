// hooks/useOffers.ts
"use client";
import { useState, useEffect } from "react";
import { Offer } from "@/models/offers";
import { useUserDataContext } from "@/context/UserDataContext";
import { fetchOffers } from "@/services/offerService";

export default function useOffers() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userData } = useUserDataContext();

  useEffect(() => {
    async function loadOffers() {
      try {
        setLoading(true);
        // Anpassung: Extrahiere die Skills aus den MatchSettings (User Modell)
        const userSkills: string[] =
          userData?.matchSettings?.categories.find(
            (cat) => cat.categoryName.toLowerCase() === "skills"
          )?.categoryEntries || [];

        // Anpassung: Extrahiere die Positions aus den MatchSettings (User Modell)
        const userPositions: string[] =
          userData?.matchSettings?.categories.find(
            (cat) => cat.categoryName.toLowerCase() === "positions"
          )?.categoryEntries || [];

        const data = await fetchOffers({ skills: userSkills, positions: userPositions });
        console.log("Alle Job Offers geladen:", data);
        setAllOffers(data);
      } catch (error) {
        console.error("Fehler beim Laden der Job Offers:", error);
      } finally {
        setLoading(false);
      }
    }
    if (userData) {
      loadOffers();
    }
  }, [userData]);

  return {
    allOffers,
    loading,
  };
}