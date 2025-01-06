"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "@firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { User, MatchSettings, MatchCategory } from "@/models/user";
import CategorySetupSection from "../sections/CategorySetupSection";
import { companyList, industryInterests, positions } from "@/utils/dataSets";

interface MatchSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: Partial<User>) => void;
}

const MatchSetup: React.FC<MatchSetupProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();

  // Kategorien lokal speichern
  const [categories, setCategories] = useState<Record<string, string[]>>({
    companies: [],
    industries: [],
    positions: [],
  });

  // Rolle (Talent / Insider)
  const [role, setRole] = useState<"Talent" | "Insider" | undefined>(undefined);

  // -----------------------------------------
  // Kategorien + Rolle aus Firestore laden
  // -----------------------------------------
  useEffect(() => {
    const fetchTagsAndRole = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<User>;
          const matchSettings: MatchSettings = data.matchSettings || {
            categories: [],
          };

          // Rolle setzen
          setRole(data.role);

          // Kategorien aus matchSettings in unseren State mappen
          const loadedCategories = matchSettings.categories.reduce<
            Record<string, string[]>
          >((acc, category) => {
            acc[category.categoryName] = category.categoryEntries;
            return acc;
          }, {});

          setCategories({
            companies: loadedCategories["companies"] || [],
            industries: loadedCategories["industries"] || [],
            positions: loadedCategories["positions"] || [],
          });
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Kategorien/Rolle: ", error);
      }
    };

    if (isOpen) {
      fetchTagsAndRole();
    }
  }, [isOpen, user]);

  // -----------------------------------------
  // Handler zum aktualisieren der Tags
  // -----------------------------------------
  const handleChange = (categoryName: string, tags: string[]) => {
    setCategories((prev) => ({
      ...prev,
      [categoryName]: tags,
    }));
  };

  // -----------------------------------------
  // SPEICHERN der Kategorien
  // -----------------------------------------
  const handleSave = async () => {
    if (!user) {
      console.error("Benutzer ist nicht authentifiziert");
      return;
    }

    try {
      // 1) Hole den aktuellen Stand (z.B. searchImmediately)
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const existingData = docSnap.data() as Partial<User> | undefined;
      const existingMatchSettings = existingData?.matchSettings || {};

      // 2) Nur Kategorien ersetzen, restliche Felder (z.B. searchImmediately) beibehalten
      const updatedCategories: MatchCategory[] = [
        {
          categoryName: "companies",
          categoryEntries: categories.companies,
        },
        {
          categoryName: "industries",
          categoryEntries: categories.industries,
        },
        {
          categoryName: "positions",
          categoryEntries: categories.positions,
        },
      ];

      const updatedMatchSettings: MatchSettings = {
        ...existingMatchSettings, // searchImmediately bleibt erhalten
        categories: updatedCategories,
      };

      // 3) Neues User-Objekt für Firestore
      const updatedData: Partial<User> = {
        matchSettings: updatedMatchSettings,
      };

      // 4) Speichern mit merge: true
      await setDoc(userRef, updatedData, { merge: true });
      console.log("Einstellungen (Kategorien) gespeichert.");

      // 5) Optional: Callback an das Eltern-Element
      if (onSave) {
        onSave(updatedData);
      }

      // Modal schließen
      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern der Daten: ", error);
    }
  };

  // -----------------------------------------
  // Kategorie-Titel je nach Rolle
  // -----------------------------------------
  const getCategoryTitles = () => {
    if (role === "Insider") {
      return {
        companies: "Welche Firma vertrittst du?",
        industries: "Welche Branchen sind für deine Firma relevant?",
        positions: "Welche Positionen in deiner Firma sind relevant?",
      };
    }
    // Default: Talent
    return {
      companies: "An welchen Firmen bist du interessiert?",
      industries: "Welche Branchen sind für Dich relevant?",
      positions: "An welchen Positionen bist du besonders interessiert?",
    };
  };
  const categoryTitles = getCategoryTitles();

  // -----------------------------------------
  // UI - Modal
  // -----------------------------------------
  return (
    <div className={`modal ${isOpen ? "modal-open" : ""} text-sm`}>
      <div className="modal-box relative max-w-xl w-full">
        {/* Close-Button */}
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="max-h-[70vh] overflow-y-auto pb-24">
          <h2 className="text-xl font-semibold">Match Setup</h2>

          {/* Firmen */}
          <CategorySetupSection
            title={categoryTitles.companies}
            categoryName="companies"
            dataList={companyList}
            initialTags={categories.companies}
            onTagsChange={(tags) => handleChange("companies", tags)}
            mode="active"
            singleSelection={role === "Insider"} // Nur Insider wählt eine Firma
          />

          {/* Branchen */}
          <CategorySetupSection
            title={categoryTitles.industries}
            categoryName="industries"
            dataList={industryInterests}
            initialTags={categories.industries}
            onTagsChange={(tags) => handleChange("industries", tags)}
            mode="active"
            singleSelection={false}
          />

          {/* Positionen */}
          <CategorySetupSection
            title={categoryTitles.positions}
            categoryName="positions"
            dataList={positions}
            initialTags={categories.positions}
            onTagsChange={(tags) => handleChange("positions", tags)}
            mode="active"
            singleSelection={false}
          />
        </div>

        {/* Bottom-Bar mit Speichern */}
        <div className="absolute bottom-0 left-0 w-full border-t border-gray-300 bg-white p-4 flex justify-end">
          <button className="btn btn-primary text-white" onClick={handleSave}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchSetup;
