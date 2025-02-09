// Dashboard.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { categoryTitles } from "@/utils/categoryHandler";

import MatchSetupModal from "@/components/elements/modals/MatchSetupModal";
import EditButton from "@/components/elements/buttons/EditButton";
import DashboardCard from "@/components/elements/cards/DashboardCard";
import LoadingIcon from "@/public/Loading";
import CategorySetupSection from "@/components/elements/sections/CategorySetupSection";
import SearchStatus from "./SearchStatus";
import ProfileSettingsModal from "@/components/elements/modals/ProfileSettingsModal";
import { useUserDataContext } from "@/context/UserDataContext";

export default function Dashboard() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData, setUserData } = useUserDataContext();

  // Profile settings Modal
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] =
    useState(false);
  // Match setup Modal
  const [isMatchSetupModalOpen, setIsMatchSetupModalOpen] = useState(false);

  const checkAllCategoriesFilled = () => {
    if (!userData?.matchSettings?.categories) return false;
    const requiredCategories = [
      "companies",
      "industries",
      "positions",
      "skills",
    ];
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

  return (
    <div>
      {/* Container nur noch einspaltig */}
      <div className="flex flex-1 text-sm p-4">
        {/* max-w-7xl kann beibehalten werden, um eine Maximalbreite zu setzen */}
        <div className="flex w-full flex-col gap-4 pt-4 pb-4">
          {/* 1. Card: Profil */}
          <DashboardCard className="bg-white relative">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex-shrink-0 flex justify-center items-center text-sm">
                <EditButton
                  onClick={() => setIsProfileSettingsModalOpen(true)}
                />

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
                <div className="mt-1">
                  <SearchStatus
                    userId={user.uid}
                    searchImmediately={
                      userData?.matchSettings?.searchImmediately ?? false
                    }
                    setUserData={setUserData}
                  />
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* ProfileSettings Modal */}
          {isProfileSettingsModalOpen && (
            <ProfileSettingsModal
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

          {/* 2. Card: Match Setup */}
          <DashboardCard className="bg-white relative">
            <EditButton onClick={() => setIsMatchSetupModalOpen(true)} />
            <h2 className="text-xl flex items-center gap-2">
              Profil
              {allCategoriesFilled ? (
                <FaCheckCircle className="text-green-500" />
              ) : (
                <FaTimesCircle className="text-red-500" />
              )}
            </h2>
            {["companies", "positions", "skills", "industries"].map(
              (category) => (
                <CategorySetupSection
                  key={category}
                  title={categoryTitles[role][category]}
                  categoryName={category}
                  initialTags={getCategoryEntries(category)}
                  mode="passive"
                />
              )
            )}
          </DashboardCard>

          {/* ProfileSettings Modal */}
          {isMatchSetupModalOpen && (
            <MatchSetupModal
              isOpen={isMatchSetupModalOpen}
              onClose={() => setIsMatchSetupModalOpen(false)}
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
    </div>
  );
}
