"use client";

import React, { useState, useEffect } from "react";
import AutocompleteTagInput from "../Inputs/AutoCompleteTagInput";
import { companyList, industryInterests, positions } from "@/utils/dataSets";
import { useAuth } from "@/context/authContext";
import { doc, setDoc, getDoc } from "@firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/models/user";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: Partial<User>) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchTags = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setSelectedCompanies(data.companies || []);
            setSelectedIndustries(data.industries || []);
            setSelectedPositions(data.positions || []);
          }
        } catch (error) {
          console.error("Fehler beim Abrufen der Tags: ", error);
        }
      }
    };

    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, user]);

  const handleCompaniesChange = (tags: string[]) => {
    setSelectedCompanies(tags);
  };

  const handleIndustriesChange = (tags: string[]) => {
    setSelectedIndustries(tags);
  };

  const handlePositionsChange = (tags: string[]) => {
    setSelectedPositions(tags);
  };

  const handleSave = async () => {
    if (!user) {
      console.error("Benutzer ist nicht authentifiziert");
      return;
    }

    const updatedData = {
      companies: selectedCompanies,
      industries: selectedIndustries,
      positions: selectedPositions,
    };

    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(userRef, updatedData, { merge: true });
      console.log("Einstellungen gespeichert");

      // Rufe das onSave-Callback mit den aktualisierten Daten auf
      if (onSave) {
        onSave(updatedData);
      }

      // Modal schließen
      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern der Daten: ", error);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box relative max-w-xl w-full">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="max-h-[70vh] overflow-y-auto pb-24">
          <h2 className="text-xl font-bold">Match-Einstellungen</h2>
          <div>
            <h3 className="text-lg mb-2 mt-4">Spannende Firmen</h3>
            <AutocompleteTagInput
              onTagsChange={handleCompaniesChange}
              dataList={companyList}
              initialTags={selectedCompanies}
            />
          </div>
          <div>
            <h3 className="text-lg mb-2 mt-4">Brancheninteressen</h3>
            <AutocompleteTagInput
              onTagsChange={handleIndustriesChange}
              dataList={industryInterests}
              initialTags={selectedIndustries}
            />
          </div>
          <div>
            <h3 className="text-lg mb-2 mt-4">Relevante Positionen</h3>
            <AutocompleteTagInput
              onTagsChange={handlePositionsChange}
              dataList={positions}
              initialTags={selectedPositions}
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full border-t border-gray-300 bg-white p-4 flex justify-end">
          <button className="btn btn-primary" onClick={handleSave}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
