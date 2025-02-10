"use client";
import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import OfferCard from "@/components/elements/cards/OfferCard";
import ReferralModal from "@/components/elements/modals/ReferralModal";
import { Offer } from "@/models/offers";
// CODE-ÄNDERUNG: Statt useOffers Hook => useOfferContext
import { useOfferContext } from "@/context/OfferContext";
import { useUserDataContext } from "@/context/UserDataContext";

export default function OfferCreation() {
  const { userData } = useUserDataContext();
  const role = userData?.role;

  // CODE-ÄNDERUNG: userOffers, saveOffer und removeOffer aus OfferContext holen
  const { userOffers, saveOffer, removeOffer } = useOfferContext();

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // 1) Neues Angebot erstellen
  const handleCreateOffer = () => {
    setEditingOffer(null);
    setIsOfferModalOpen(true);
  };

  // 2) Vorhandenes Angebot bearbeiten
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setIsOfferModalOpen(true);
  };

  // 3) Speichern
  const handleSaveOffer = async (offer: Omit<Offer, "uid">) => {
    if (!userData?.uid) {
      console.error("Benutzer-UID nicht verfügbar!");
      return;
    }
    try {
      await saveOffer(offer, userData.uid, editingOffer || undefined);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
    setIsOfferModalOpen(false);
    setEditingOffer(null);
  };

  // 5) Maximal 2 Offers
  const canCreateOffer = userOffers.length < 2;
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

          <div className="flex flex-row gap-4">
            {/* userOffers stattdessen direkt nutzen */}
            {userOffers.map((offer) => (
              <div key={offer.id}>
                <OfferCard
                  offer={offer}
                  onClick={() => handleEditOffer(offer)}
                  onDelete={() => removeOffer(offer.id)}
                />
              </div>
            ))}

            {/* Hinzufügen-Button */}
            <div className="w-full sm:w-1/2 lg:w-1/4 min-w-[200px] min-h-[200px] flex items-center justify-center">
              {createOfferButton}
            </div>
          </div>
        </DashboardCard>
      )}

      {role === "Talent" && (
        <DashboardCard className="bg-white">
          <h2 className="text-xl mb-4">Mein Offer</h2>

          <div className="flex flex-row gap-4">
            {userOffers.map((offer) => (
              <div key={offer.id}>
                <OfferCard
                  offer={offer}
                  onClick={() => handleEditOffer(offer)}
                  onDelete={() => removeOffer(offer.id)}
                />
              </div>
            ))}

            {/* Hinzufügen-Button */}
            <div
              className="
                w-full 
                sm:w-1/2 
                lg:w-1/4 
                min-w-[200px] 
                flex items-center justify-center min-h-[150px]
              "
            >
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
