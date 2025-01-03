"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { companyList, industryInterests, positions } from "@/utils/dataSets";
import { categoryTitles } from "@/utils/categoryHandler";
import useUserData from "@/hooks/useUserData";
import MatchSetup from "@/components/modals/MatchSetup";
import EditButton from "@/components/buttons/EditButton";
import DashboardCard from "@/components/cards/DashboardCard";
import LoadingIcon from "@/components/icons/Loading";
import CategorySetupSection from "@/components/sections/CategorySetupSection";

export default function Dashboard() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData, setUserData } = useUserData();

  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] =
    useState(false);

  // Prüfen, ob alle Kategorien gefüllt sind
  const checkAllCategoriesFilled = () => {
    if (!userData?.matchSettings?.categories) return false;
    const requiredCategories = ["companies", "industries", "positions"];
    return requiredCategories.every((cat) =>
      userData.matchSettings?.categories.some(
        (category) =>
          category.categoryName === cat && category.categoryEntries.length > 0
      )
    );
  };
  const allCategoriesFilled = checkAllCategoriesFilled();

  // Kategorien holen
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

  return (
    <div>
      {/* Container nur noch einspaltig */}
      <div className="flex justify-center px-4 flex-1 text-sm">
        {/* max-w-7xl kann beibehalten werden, um eine Maximalbreite zu setzen */}
        <div className="flex w-full max-w-7xl flex-col gap-4 pt-4 pb-4">
          {/* 1. Card: Profil */}
          <DashboardCard>
            <EditButton onClick={() => setIsProfileEditModalOpen(true)} />
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

          {/* 3. Card: Inserierte Stellenangebote */}
          <DashboardCard>
            <h2 className="text-xl">Inserierte Stellenangebote</h2>
            {/* Hier dein Inhalt */}
          </DashboardCard>
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
    </div>
  );
}
