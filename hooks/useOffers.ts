"use client";
import { useState, useEffect } from "react";
import { Offer } from "@/models/offers";
import { useUserDataContext } from "@/context/UserDataContext";
import { offerService } from "@/services/offerService";

export default function useOffers() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]); // <-- Hier ist unser lokaler State
  const [loading, setLoading] = useState<boolean>(true);
  const { userData } = useUserDataContext();

  useEffect(() => {
    async function loadOffers() {
      try {
        setLoading(true);
        // Anpassung: Extrahiere die Skills aus den MatchSettings
        const userSkills: string[] =
          userData?.matchSettings?.categories.find(
            (cat) => cat.categoryName.toLowerCase() === "skills"
          )?.categoryEntries || [];

        // Anpassung: Extrahiere die Positions
        const userPositions: string[] =
          userData?.matchSettings?.categories.find(
            (cat) => cat.categoryName.toLowerCase() === "positions"
          )?.categoryEntries || [];

        // Abfrage an den Service mit den extrahierten Parametern
        const data = await offerService({
          skills: userSkills,
          positions: userPositions,
        });
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
    setAllOffers, // <-- NEU/Anpassung: Setter-Funktion mit zurückgeben
    loading,
  };
}