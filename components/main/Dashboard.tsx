"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/authContext";
import EditButton from "../buttons/EditButton";
import ProfileSettings from "../modals/MatchSetup"; // Angepasster Import
import LoadingIcon from "../icons/Loading";
import DashboardCard from "../cards/DashboardCard";
import Chat from "../chat/chat";
import { User } from "@/models/user";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { companyList, industryInterests, positions } from "@/utils/dataSets";
import CategorySetupSection from "../sections/CategorySetupSection";
import { categoryTitles } from "@/utils/categoryHandler";

export default function Dashboard() {
  const { user, loading: loadingAuth } = useAuth();
  const [userData, setUserData] = useState<Partial<User> | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] =
    useState(false);

  const [activeSearch, setActiveSearch] = useState<boolean>(true);

  // Firestore-Daten abrufen
  const fetchUserData = async () => {
    if (user) {
      setLoadingData(true);
      const userRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          // Cast auf Partial<User>, da nicht zwingend alle Felder vorhanden
          const data = docSnap.data() as Partial<User>;
          setUserData(data);
        } else {
          console.log("Dokument existiert nicht!");
          setUserData(null);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Benutzerdaten: ", error);
      } finally {
        setLoadingData(false);
      }
    } else {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  if (loadingAuth || loadingData) {
    return <LoadingIcon />;
  }

  if (!user) {
    return <div>Bitte melde dich an, um dein Dashboard zu sehen.</div>;
  }

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

  // Hilfsfunktion, um bestimmte Kategorien zu holen
  const getCategoryEntries = (name: string) => {
    return (
      userData?.matchSettings?.categories.find(
        (cat) => cat.categoryName === name
      )?.categoryEntries || []
    );
  };

  // Bestimmen der Rolle des Nutzers, Standard "Talent"
  const role = userData?.role || "Talent";

  return (
    <div className="flex justify-center px-4 lg:px-8 flex-1 bg-slate-200 text-sm">
      <div className="flex w-full max-w-7xl gap-4 flex-col lg:flex-row pt-4 pb-4">
        {/* ---- Linke Spalte ---- */}
        <div className="flex flex-col gap-4 w-full lg:w-1/3">
          {/* Profil Komponente */}
          <DashboardCard>
            <EditButton onClick={() => setIsProfileEditModalOpen(true)} />
            <div className="flex items-center">
              <div className="w-24 h-24 bg-gray-400 rounded-full flex-shrink-0 flex justify-center items-center text-sm">
                {/* Platzhalter für Profilbild */}
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
                <p className="text-sm text-primary">
                  {userData?.role ?? "Unbekannte Rolle"}
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* Settings Komponente */}
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

            {/* Passive Darstellung der Kategorien mit dynamischen Titeln */}
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

          {/* Platz für weitere Komponenten */}
          <DashboardCard>
            <h2 className="text-xl">Inserierte Stellenangebote</h2>
            {/* Hier könnte Ihr Inhalt zu Stellenangeboten stehen */}
          </DashboardCard>
        </div>

        {/* ---- Rechte Spalte ---- */}
        <div className="flex flex-col w-full lg:w-2/3">
          <DashboardCard className="flex-grow">
            <h2 className="text-xl">Aktive Matches</h2>
            {activeSearch ? (
              <div className="flex items-center justify-center mt-4">
                <svg
                  className="w-5 h-5 text-green-500 animate-spin mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span className="text-green-500 font-semibold">
                  Suche läuft...
                </span>
              </div>
            ) : (
              <p className="text-sm mt-4">Keine aktive Suche.</p>
            )}

            {/* Chat UI */}
            <div className="mt-8">
              <h3 className="text-base font-semibold mb-4">Chat</h3>
              <Chat />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Modals */}
      {isProfileSettingsModalOpen && (
        <ProfileSettings
          isOpen={isProfileSettingsModalOpen}
          onClose={() => setIsProfileSettingsModalOpen(false)}
          onSave={(updatedData) => {
            // Die lokalen Daten aktualisieren, damit UI die Änderungen anzeigt
            setUserData((prev) => ({
              ...prev,
              ...updatedData,
            }));
          }}
        />
      )}
    </div>
  );
}
