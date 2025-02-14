"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "@firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";

import { User, MatchSettings, MatchCategory } from "@/models/user";
import CategorySetupSection from "../sections/CategorySetupSection";
import { Button } from "../../ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { categoryTitles } from "@/utils/categoryHandler";
import { useUserDataContext } from "@/context/UserDataContext";

// CODE-ÄNDERUNG: useDirectMatch importieren
import useDirectMatch from "@/hooks/useDirectMatch";

interface MatchSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: Partial<User>) => void;
}

const MatchSetupModal: React.FC<MatchSetupProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const { setUserData } = useUserDataContext();
  const { userData } = useUserDataContext();

  const [categories, setCategories] = useState<Record<string, string[]>>({
    companies: [],
    industries: [],
    positions: [],
    skills: [],
  });

  const [role, setRole] = useState<"Talent" | "Insider" | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

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
          setRole(data.role);

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
            skills: loadedCategories["skills"] || [],
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

  const { getMatch } = useDirectMatch({
    userData: userData,
  });

  const handleChange = (categoryName: string, tags: string[]) => {
    setCategories((prev) => ({
      ...prev,
      [categoryName]: tags,
    }));
  };

  const handleSave = async () => {
    if (!user) {
      console.error("Benutzer ist nicht authentifiziert");
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      const existingData = docSnap.data() as Partial<User> | undefined;
      const existingMatchSettings = existingData?.matchSettings || {};

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
        {
          categoryName: "skills",
          categoryEntries: categories.skills,
        },
      ];

      const updatedMatchSettings: MatchSettings = {
        ...existingMatchSettings,
        categories: updatedCategories,
      };

      const updatedData: Partial<User> = {
        matchSettings: updatedMatchSettings,
      };

      // Speichern der Daten in Firestore
      await setDoc(userRef, updatedData, { merge: true });
      console.log("Einstellungen (Kategorien) gespeichert.");

      // Aktualisiere den UserDataContext
      setUserData((prevData) => ({
        ...prevData,
        matchSettings: updatedMatchSettings,
      }));

      if (onSave) {
        onSave(updatedData);
      }

      // CODE-ÄNDERUNG: Falls searchImmediately true und alle Kategorien gefüllt -> Matching
      // 1. Prüfe, ob searchImmediately an ist
      if (updatedMatchSettings.searchImmediately) {
        // 2. Prüfe, ob alle relevanten Kategorien gefüllt sind
        const requiredCategories = [
          "companies",
          "positions",
          "skills",
          "industries",
        ];
        const allCatsFilled = requiredCategories.every(
          (cat) =>
            updatedCategories.find((x) => x.categoryName === cat)
              ?.categoryEntries.length ?? 0 > 0
        );

        // 3. Nur wenn alle Categories & searchImmediately => rufe getMatch()
        if (allCatsFilled) {
          console.log(
            "Starte Matching, da Kategorien vollständig und searchImmediately = true."
          );
          await getMatch();
        }
      }

      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern der Daten: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle>Match Setup</DialogTitle>
          <DialogDescription>
            Wähle deine bevorzugten Kategorien aus.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {/* Firmen */}
          <CategorySetupSection
            title={
              role === "Insider"
                ? categoryTitles.Insider.companies
                : categoryTitles.Talent.companies
            }
            categoryName="companies"
            initialTags={categories.companies}
            onTagsChange={(tags) => handleChange("companies", tags)}
            mode="active"
            singleSelection={role === "Insider"}
          />
          {/* Positionen */}
          <CategorySetupSection
            title={
              role === "Insider"
                ? categoryTitles.Insider.positions
                : categoryTitles.Talent.positions
            }
            categoryName="positions"
            initialTags={categories.positions}
            onTagsChange={(tags) => handleChange("positions", tags)}
            mode="active"
            singleSelection={false}
          />
          {/* Skills */}
          <CategorySetupSection
            title={
              role === "Insider"
                ? categoryTitles.Insider.skills
                : categoryTitles.Talent.skills
            }
            categoryName="skills"
            initialTags={categories.skills}
            onTagsChange={(tags) => handleChange("skills", tags)}
            mode="active"
            singleSelection={false}
          />
          {/* Branchen */}
          <CategorySetupSection
            title={
              role === "Insider"
                ? categoryTitles.Insider.industries
                : categoryTitles.Talent.industries
            }
            categoryName="industries"
            initialTags={categories.industries}
            onTagsChange={(tags) => handleChange("industries", tags)}
            mode="active"
            singleSelection={false}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Speichern
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MatchSetupModal;
