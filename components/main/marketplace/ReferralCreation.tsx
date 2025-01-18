"use client";

import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext"; // Annahme: Pfad anpassen
import useUserData from "@/hooks/useUserData"; // Annahme: Pfad anpassen
import DashboardCard from "@/components/elements/cards/DashboardCard";
import JobOfferCard from "@/components/elements/cards/JobOfferCard";
import ReferralModal from "@/components/elements/modals/ReferralModal";
import { JobOffer } from "@/models/referral";

export default function ReferralCreation() {
  const { userData } = useUserData();

  // Rolle des Nutzers
  const role = userData?.role;

  // State mit allen Job-Offers
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);

  // Modal-Handling für neues / zu bearbeitendes Angebot
  const [isJobOfferModalOpen, setIsJobOfferModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Temporäre Felder für das Bearbeiten/Erstellen
  const [tempCompany, setTempCompany] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempReferral, setTempReferral] = useState("");

  const handleSaveJobOffer = (
    company: string,
    position: string,
    description: string,
    referral: string
  ) => {
    if (editIndex !== null) {
      // Edit-Fall
      const updatedOffers = [...jobOffers];
      updatedOffers[editIndex] = {
        company,
        position,
        description,
        referralLink: referral,
      };
      setJobOffers(updatedOffers);
    } else {
      // Neu-Fall
      const newOffer: JobOffer = {
        company,
        position,
        description,
        referralLink: referral,
      };
      console.log(newOffer);
      setJobOffers((prev) => [...prev, newOffer]);
    }
    setIsJobOfferModalOpen(false);
    setEditIndex(null);
  };

  const handleEditJobOffer = (index: number) => {
    const offer = jobOffers[index];
    setEditIndex(index);
    setTempCompany(offer.company);
    setTempDescription(offer.description);
    setTempReferral(offer.referralLink);
    setIsJobOfferModalOpen(true);
  };

  const handleDeleteJobOffer = (index: number) => {
    const updated = jobOffers.filter((_, i) => i !== index);
    setJobOffers(updated);
  };

  return (
    <div>
      {role === "Insider" && (
        <DashboardCard className="bg-white">
          <h2 className="text-xl mb-4">Mein Referral</h2>
          <div className="flex gap-4 flex-wrap items-start">
            {jobOffers.map((offer, index) => (
              <div key={index} className="w-1/4 min-w-[200px]">
                <JobOfferCard
                  offer={offer}
                  onClick={() => handleEditJobOffer(index)}
                  onDelete={() => handleDeleteJobOffer(index)}
                />
              </div>
            ))}
            <div className="w-1/4 min-w-[200px] flex items-center justify-center min-h-[150px]">
              <FaPlusCircle
                className="text-4xl text-primary cursor-pointer hover:text-primary/80 transition-colors"
                onClick={() => {
                  setEditIndex(null);
                  setTempCompany("");
                  setTempDescription("");
                  setTempReferral("");
                  setIsJobOfferModalOpen(true);
                }}
              />
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Verwendung der ausgelagerten Modal-Komponente */}
      <ReferralModal
        isOpen={isJobOfferModalOpen}
        initialPosition={tempCompany}
        initialDescription={tempDescription}
        initialReferral={tempReferral}
        onClose={() => setIsJobOfferModalOpen(false)}
        onSave={handleSaveJobOffer}
      />
    </div>
  );
}
