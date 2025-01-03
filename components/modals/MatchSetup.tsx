"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "@firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { User, MatchSettings } from "@/models/user";
import CategorySetupSection from "../sections/CategorySetupSection";
import { companyList, industryInterests, positions } from "@/utils/dataSets";

interface MatchSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: Partial<User>) => void;
}

const MatchSetup: React.FC<MatchSetupProps> = ({ isOpen, onClose, onSave }) => {
  // Lokaler State für die Kategorien
  const [categories, setCategories] = useState<Record<string, string[]>>({
    companies: [],
    industries: [],
    positions: [],
  });

  // Lokaler State für die Benutzerrolle
  const [role, setRole] = useState<"Talent" | "Insider" | undefined>(undefined);

  const { user } = useAuth();

  // Lädt die bereits gespeicherten Kategorien und die Rolle aus Firestore
  useEffect(() => {
    const fetchTagsAndRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<User>;
            const matchSettings: MatchSettings = data.matchSettings || {
              categories: [],
            };

            // Rolle setzen
            setRole(data.role);

            // Kategorien auf unser lokales State-Format mappen
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
          console.error("Fehler beim Abrufen der Tags und Rolle: ", error);
        }
      }
    };

    if (isOpen) {
      fetchTagsAndRole();
    }
  }, [isOpen, user]);

  // Aktualisiert unsere lokalen Kategorien, wenn sich ein Tag ändert
  const handleChange = (categoryName: string, tags: string[]) => {
    setCategories((prev) => ({
      ...prev,
      [categoryName]: tags,
    }));
  };

  // Speichert die Kategorien zurück in Firestore
  const handleSave = async () => {
    if (!user) {
      console.error("Benutzer ist nicht authentifiziert");
      return;
    }

    // matchSettings entsprechend unseren Interfaces
    const updatedData: Partial<User> = {
      matchSettings: {
        categories: [
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
        ],
      },
    };

    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(userRef, updatedData, { merge: true });
      console.log("Einstellungen gespeichert");

      // Callback aufrufen, damit die darüberliegende Komponente State aktualisieren kann
      if (onSave) {
        onSave(updatedData);
      }

      // Modal schließen
      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern der Daten: ", error);
    }
  };

  // Lokales Array für die Titel basierend auf der Rolle
  const getCategoryTitles = () => {
    if (role === "Insider") {
      return {
        companies: "Welche Firma vertrittst du?",
        industries: "Welche Branchen sind für deine Firma relevant?",
        positions: "Welche Positionen in deiner Firma sind relevant?",
      };
    } else {
      // Default-Titel für Talent
      return {
        companies: "An welchen Firmen bist du interessiert?",
        industries: "Welche Branchen sind für Dich relevant?",
        positions: "An welchen Positionen bist du besonders interessiert?",
      };
    }
  };

  const categoryTitles = getCategoryTitles();

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""} text-sm`}>
      <div className="modal-box relative max-w-xl w-full">
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
            singleSelection={role === "Insider"} // Einzelne Auswahl nur für Insider
          />

          {/* Branchen */}
          <CategorySetupSection
            title={categoryTitles.industries}
            categoryName="industries"
            dataList={industryInterests}
            initialTags={categories.industries}
            onTagsChange={(tags) => handleChange("industries", tags)}
            mode="active"
            singleSelection={false} // Mehrfachauswahl erlaubt
          />

          {/* Positionen */}
          <CategorySetupSection
            title={categoryTitles.positions}
            categoryName="positions"
            dataList={positions}
            initialTags={categories.positions}
            onTagsChange={(tags) => handleChange("positions", tags)}
            mode="active"
            singleSelection={false} // Mehrfachauswahl erlaubt
          />
        </div>

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
