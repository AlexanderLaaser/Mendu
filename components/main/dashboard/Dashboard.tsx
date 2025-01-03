"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaCheckCircle, FaTimesCircle, FaPlusCircle } from "react-icons/fa";
import { companyList, industryInterests, positions } from "@/utils/dataSets";
import { categoryTitles } from "@/utils/categoryHandler";
import useUserData from "@/hooks/useUserData";

// Neue Komponente & Typen importieren
import JobOfferCard, { JobOffer } from "@/components/cards/JobOfferCard";

import MatchSetup from "@/components/modals/MatchSetup";
import EditButton from "@/components/buttons/EditButton";
import DashboardCard from "@/components/cards/DashboardCard";
import LoadingIcon from "@/components/icons/Loading";
import CategorySetupSection from "@/components/sections/CategorySetupSection";

export default function Dashboard() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData, setUserData } = useUserData();

  // Profile-Settings Modal
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] =
    useState(false);

  // State mit allen Job-Offers (nur lokal; optional Firestore-Anbindung)
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);

  // Modal-Handling für neues / zu bearbeitendes Angebot
  const [isJobOfferModalOpen, setIsJobOfferModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Formfelder für (Neu / Bearbeiten)
  const [offerCompany, setOfferCompany] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerReferral, setOfferReferral] = useState("");

  // -----------------------------------------
  // Kategorien
  // -----------------------------------------
  const checkAllCategoriesFilled = () => {
    if (!userData?.matchSettings?.categories) return false;
    const requiredCategories = ["companies", "industries", "positions"];
    return requiredCategories.every((cat) =>
      userData?.matchSettings?.categories.some(
        (category) =>
          category.categoryName === cat && category.categoryEntries.length > 0
      )
    );
  };
  const allCategoriesFilled = checkAllCategoriesFilled();

  // Kategorie-Einträge
  function getCategoryEntries(name: string) {
    return (
      userData?.matchSettings?.categories.find(
        (cat) => cat.categoryName === name
      )?.categoryEntries || []
    );
  }

  // Rolle
  const role = userData?.role || "Talent";

  // Loading / Auth-Check
  if (loadingAuth || loadingData) {
    return <LoadingIcon />;
  }
  if (!user) {
    return <div>Bitte melde dich an, um dein Dashboard zu sehen.</div>;
  }

  // -----------------------------------------
  // Neues Stellenangebot oder Bearbeiten speichern
  // -----------------------------------------
  const handleSaveJobOffer = () => {
    if (editIndex !== null) {
      // Edit-Fall
      const updatedOffers = [...jobOffers];
      updatedOffers[editIndex] = {
        company: offerCompany,
        description: offerDescription,
        referralLink: offerReferral,
      };
      setJobOffers(updatedOffers);
    } else {
      // Neu-Fall
      const newOffer: JobOffer = {
        company: offerCompany,
        description: offerDescription,
        referralLink: offerReferral,
      };
      setJobOffers((prev) => [...prev, newOffer]);
    }

    // Modal schließen & Felder leeren
    setIsJobOfferModalOpen(false);
    setEditIndex(null);
    setOfferCompany("");
    setOfferDescription("");
    setOfferReferral("");
  };

  // -----------------------------------------
  // Card anklicken => Bearbeiten
  // -----------------------------------------
  const handleEditJobOffer = (index: number) => {
    const offer = jobOffers[index];
    setEditIndex(index);
    setOfferCompany(offer.company);
    setOfferDescription(offer.description);
    setOfferReferral(offer.referralLink);
    setIsJobOfferModalOpen(true);
  };

  // -----------------------------------------
  // Löschen
  // -----------------------------------------
  const handleDeleteJobOffer = (index: number) => {
    const updated = jobOffers.filter((_, i) => i !== index);
    setJobOffers(updated);
  };

  return (
    <div>
      {/* Container nur noch einspaltig */}
      <div className="flex justify-center px-4 flex-1 text-sm">
        {/* max-w-7xl kann beibehalten werden, um eine Maximalbreite zu setzen */}
        <div className="flex w-full max-w-7xl flex-col gap-4 pt-4 pb-4">
          {/* 1. Card: Profil */}
          <DashboardCard>
            <EditButton onClick={() => setIsProfileSettingsModalOpen(true)} />
            <div className="flex items-center">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex-shrink-0 flex justify-center items-center text-sm">
                {userData?.personalData?.firstName ? (
                  <span>
                    {userData.personalData.firstName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <span>Bild</span>
                )}
              </div>
              <div className="ml-4">
                <p className="text-lg font-semibold">
                  {userData?.personalData
                    ? `${userData.personalData.firstName} ${userData.personalData.lastName}`
                    : "Vorname Nachname"}
                </p>
                <p className="text-sm">
                  {userData?.personalData?.email ?? "Email"}
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* 2. Card: Match Setup */}
          <DashboardCard>
            <EditButton onClick={() => setIsProfileSettingsModalOpen(true)} />
            <h2 className="text-xl flex items-center gap-2">
              Match Setup
              {allCategoriesFilled ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaTimesCircle className="text-red-500" />
              )}
            </h2>
            {["companies", "industries", "positions"].map((category) => (
              <CategorySetupSection
                key={category}
                title={categoryTitles[role][category]}
                categoryName={category}
                dataList={
                  category === "companies"
                    ? companyList
                    : category === "industries"
                    ? industryInterests
                    : positions
                }
                initialTags={getCategoryEntries(category)}
                mode="passive"
              />
            ))}
          </DashboardCard>

          {/* 3. Card: Inserierte Stellenangebote -> Nur wenn role === "Insider" */}
          {role === "Insider" && (
            <DashboardCard>
              <h2 className="text-xl mb-4">Inserierte Stellenangebote</h2>

              {/* Grid: Jede Card belegt 1/4 Breite, Plus-Icon hängt rechts dran */}
              <div className="flex gap-4 flex-wrap items-start">
                {/* Cards */}
                {jobOffers.map((offer, index) => (
                  <div
                    key={index}
                    className="w-1/4 min-w-[200px]" /* <- 1/4 Breite */
                  >
                    <JobOfferCard
                      offer={offer}
                      onClick={() => handleEditJobOffer(index)}
                      onDelete={() => handleDeleteJobOffer(index)}
                    />
                  </div>
                ))}

                {/* Großes Plus-Icon rechts in der Reihe */}
                <div className="w-1/4 min-w-[200px] flex items-center justify-center">
                  <FaPlusCircle
                    className="text-4xl text-primary cursor-pointer hover:text-primary/80 transition-colors"
                    onClick={() => {
                      setEditIndex(null);
                      setIsJobOfferModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </DashboardCard>
          )}
        </div>

        {/* ProfileSettings Modal */}
        {isProfileSettingsModalOpen && (
          <MatchSetup
            isOpen={isProfileSettingsModalOpen}
            onClose={() => setIsProfileSettingsModalOpen(false)}
            onSave={(updatedData) => {
              setUserData((prev) => ({
                ...prev,
                ...updatedData,
              }));
            }}
          />
        )}
      </div>

      {/* Modal zum Erstellen/Bearbeiten eines Stellenangebots */}
      {isJobOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editIndex !== null
                ? "Stellenangebot bearbeiten"
                : "Neues Stellenangebot"}
            </h2>

            <label className="block mb-2 text-sm font-medium">Firma:</label>
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              value={offerCompany}
              onChange={(e) => setOfferCompany(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium">
              Beschreibung:
            </label>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              value={offerDescription}
              onChange={(e) => setOfferDescription(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium">
              Referral-Link:
            </label>
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              value={offerReferral}
              onChange={(e) => setOfferReferral(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setIsJobOfferModalOpen(false)}
              >
                Abbrechen
              </button>
              <button className="btn btn-primary" onClick={handleSaveJobOffer}>
                Abschließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
