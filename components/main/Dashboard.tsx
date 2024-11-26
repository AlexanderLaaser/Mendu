"use client";

import React, { useEffect, useState } from "react";
import DashboardCard from "../cards/DashboardCard";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/authContext";
import EditButton from "../buttons/EditButton";
import ProfileSettings from "../modals/ProfileSettings";
import LoadingIcon from "../icons/Loading";

export default function Dashboard() {
  const { user, loading: loadingAuth } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // State für Modals
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] =
    useState(false);

  // State für aktive Suche
  const [activeSearch, setActiveSearch] = useState<boolean>(true);

  const fetchUserData = async () => {
    if (user) {
      setLoadingData(true); // Zustand loadingData auf true setzen
      const userRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("Dokument existiert nicht!");
          setUserData(null); // Zustand auf null setzen, falls das Dokument nicht existiert
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Benutzerdaten: ", error);
      } finally {
        setLoadingData(false); // Zustand loadingData auf false setzen
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

  return (
    <div className="flex justify-center pr-8 pl-8 3xl:pr-0 3xl:pl-0 flex-1">
      <div className="flex w-full flex-col max-w-3xl flex-1">
        {/* Erste Komponente */}
        <DashboardCard>
          {/* Edit Button */}
          <EditButton onClick={() => setIsProfileEditModalOpen(true)} />

          <div className="flex items-center mb-4">
            <div className="w-24 h-24 bg-gray-400 rounded-full flex-shrink-0 flex justify-center items-center">
              {/* Benutzerbild anzeigen */}
              {userData?.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt="Profilbild"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>Bild</span>
              )}
            </div>
            <div className="ml-4">
              <p className="text-xl font-semibold text-primary">
                {userData?.firstName || "Vorname"}
              </p>
              <p className="text-xl font-semibold text-primary">
                {userData?.lastName || "Nachname"}
              </p>
            </div>
          </div>
        </DashboardCard>

        {/* Zweite Komponente */}
        <DashboardCard>
          {/* Edit Button */}
          <EditButton onClick={() => setIsProfileSettingsModalOpen(true)} />
          <h2 className="text-xl font-bold">Match Einstellungen</h2>
          <h3 className="text-xl mt-4">Spannende Firmen</h3>
          {userData?.companies && userData.companies.length > 0 ? (
            <ul className="list-disc ml-6">
              {userData.companies.map((company: string) => (
                <li key={company}>{company}</li>
              ))}
            </ul>
          ) : (
            <p>Noch keine Unternehmen ausgewählt.</p>
          )}

          <h3 className="text-xl mt-4">Brancheninteressen</h3>
          {userData?.industries && userData.industries.length > 0 ? (
            <ul className="list-disc ml-6">
              {userData.industries.map((industry: string) => (
                <li key={industry}>{industry}</li>
              ))}
            </ul>
          ) : (
            <p>Noch keine Branchen ausgewählt.</p>
          )}

          <h3 className="text-xl mt-4">Relevante Positionen</h3>
          {userData?.positions && userData.positions.length > 0 ? (
            <ul className="list-disc ml-6">
              {userData.positions.map((position: string) => (
                <li key={position}>{position}</li>
              ))}
            </ul>
          ) : (
            <p>Noch keine Positionen ausgewählt.</p>
          )}
        </DashboardCard>

        {/* Dritte Komponente */}
        <DashboardCard>
          <h2 className="text-xl font-bold">Aktive Matches</h2>
          {activeSearch ? (
            <div className="flex items-center justify-center mt-4">
              {/* Icon oder Anzeige */}
              <svg
                className="w-6 h-6 text-green-500 animate-spin mr-2"
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
            <p className="mt-4">Keine aktive Suche.</p>
          )}
        </DashboardCard>
        <DashboardCard>
          <h2 className="text-xl font-bold">Inserierte Stellenangebote</h2>
        </DashboardCard>

        {/* Modals */}
        {isProfileSettingsModalOpen && (
          <ProfileSettings
            isOpen={isProfileSettingsModalOpen}
            onClose={() => setIsProfileSettingsModalOpen(false)}
            onSave={(updatedData) => {
              // Aktualisiere den lokalen Zustand mit den neuen Daten
              setUserData((prevUserData: any) => ({
                ...prevUserData,
                ...updatedData,
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
