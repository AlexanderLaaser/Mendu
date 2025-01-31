"use client";

import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import OfferCard from "@/components/elements/cards/OfferCard";
import ReferralModal from "@/components/elements/modals/ReferralModal";
import { Offer } from "@/models/offers";
import useOffers from "@/hooks/useOffers";
import { useUserDataContext } from "@/context/UserDataProvider";

export default function OfferCreation() {
  const { userData } = useUserDataContext();
  const role = userData?.role;
  const { Offers, saveOffer, removeOffer } = useOffers();

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Öffnet das Modal zum Erstellen eines neuen Angebots
  const handleCreateOffer = () => {
    setEditingOffer(null);
    setIsOfferModalOpen(true);
  };

  // Öffnet das Modal zum Bearbeiten eines bestehenden Angebots
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setIsOfferModalOpen(true);
  };

  // Übergibt die Speichern-Logik an das Modal
  const handleSaveOffer = async (offer: Omit<Offer, "uid">) => {
    if (!userData?.uid) {
      console.error("Benutzer-UID nicht verfügbar!");
      return;
    }
    try {
      // Übergibt die Parameter an den Hook
      await saveOffer(offer, userData.uid, editingOffer || undefined);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
    setIsOfferModalOpen(false);
    setEditingOffer(null);
  };

  // Filtere die Offers, sodass nur diejenigen angezeigt werden, die vom aktuell angemeldeten User erstellt wurden
  const userOffers = Offers.filter((offer) => offer.uid === userData?.uid);

  // Prüfe, ob der Benutzer ein neues Offer erstellen kann (max. 2)
  const canCreateOffer = userOffers.length < 2;

  // Erstelle den Plus-Icon-Button, der abhängig von canCreateOffer funktioniert
  const createOfferButton = (
    <FaPlusCircle
      className={`text-4xl ${
        canCreateOffer
          ? "text-primary cursor-pointer hover:text-primary/80"
          : "text-gray-400 cursor-not-allowed"
      } transition-colors`}
      onClick={canCreateOffer ? handleCreateOffer : undefined}
    />
  );

  return (
    <div>
      {role === "Insider" && (
        <DashboardCard className="bg-white">
          <h2 className="text-xl mb-4">Meine Referrals</h2>
          <div className="flex gap-4 flex-wrap items-start">
            {userOffers.map((offer) => (
              <div key={offer.id} className="w-1/4 min-w-[200px]">
                <OfferCard
                  offer={offer}
                  onClick={() => handleEditOffer(offer)}
                  onDelete={() => removeOffer(offer.id)}
                />
              </div>
            ))}

            <div className="w-1/4 min-w-[200px] flex items-center justify-center min-h-[150px]">
              {createOfferButton}
            </div>
          </div>
        </DashboardCard>
      )}

      {role === "Talent" && (
        <DashboardCard className="bg-white">
          <h2 className="text-xl mb-4">Mein Offer</h2>
          <div className="flex gap-4 flex-wrap items-start">
            {userOffers.map((offer) => (
              <div key={offer.id} className="w-1/4 min-w-[200px]">
                <OfferCard
                  offer={offer}
                  onClick={() => handleEditOffer(offer)}
                  onDelete={() => removeOffer(offer.id)}
                />
              </div>
            ))}

            <div className="w-1/4 min-w-[200px] flex items-center justify-center min-h-[150px]">
              {createOfferButton}
            </div>
          </div>
        </DashboardCard>
      )}

      <ReferralModal
        isOpen={isOfferModalOpen}
        editingOffer={editingOffer}
        onClose={() => setIsOfferModalOpen(false)}
        onSave={handleSaveOffer}
      />
    </div>
  );
}
