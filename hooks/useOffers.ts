// hooks/useOffers.ts
import { useState, useEffect } from "react";
import { Offer } from "@/models/offers";
import { createOffer, deleteOffer, fetchOffers, updateOffer } from "@/services/offerService";


export default function useOffers() {
  const [Offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const data = await fetchOffers();
        setOffers(data);
      } catch (error) {
        console.error("Fehler beim Laden der Job Offers:", error);
      }
    };
    loadOffers();
  }, []);

  const saveOffer = async (offer: Omit<Offer, "uid">, userId: string, editingOffer?: Offer) => {
    try {
      if (editingOffer?.id) {
        const updated = await updateOffer(editingOffer.id, {
          ...offer,
          uid: userId,
          id: editingOffer.id,
        });
        setOffers((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const created = await createOffer({
          ...offer,
          uid: userId,
          id: "",
        });
        setOffers((prev) => [...prev, created]);
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      throw error;
    }
  };

  const removeOffer = async (offerId: string) => {
    try {
      await deleteOffer(offerId);
      setOffers((prev) => prev.filter((item) => item.id !== offerId));
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      throw error;
    }
  };

  return { Offers, saveOffer, removeOffer };
}
