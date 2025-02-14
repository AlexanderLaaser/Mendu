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
// CODE-ÄNDERUNG: useDirectMatch nur importieren, nicht mehr userData als Argument übergeben
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
  const { userData, setUserData } = useUserDataContext();
  const { getMatch } = useDirectMatch(); // CODE-ÄNDERUNG: kein userData beim Hook-Aufruf

  // State für Kategorien
  const [categories, setCategories] = useState<Record<string, string[]>>({
    companies: [],
    industries: [],
    positions: [],
    skills: [],
  });

  // State für Input-Fehlermeldungen
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Input Checker: Validiert, ob alle erforderlichen Kategorien gefüllt sind
  const validateInputs = (): boolean => {
    const requiredCategories = [
      "companies",
      "positions",
      "skills",
      "industries",
    ];
    const newErrors: Record<string, string> = {};

    requiredCategories.forEach((cat) => {
      if (!categories[cat] || categories[cat].length === 0) {
        newErrors[cat] = "Dieses Feld darf nicht leer sein.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (categoryName: string, tags: string[]) => {
    setCategories((prev) => ({
      ...prev,
      [categoryName]: tags,
    }));
    // Sobald sich der Input ändert, entfernen wir ggf. die Fehlermeldung für diese Kategorie
    setErrors((prev) => ({ ...prev, [categoryName]: "" }));
  };

  const handleSave = async () => {
    if (!user) {
      console.error("Benutzer ist nicht authentifiziert");
      return;
    }

    if (!validateInputs()) {
      console.error("Bitte füllen Sie alle Felder korrekt aus.");
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

      // CODE-ÄNDERUNG: Erst *danach* UserData im State aktualisieren und in passender Variable halten
      const newUserData: User = {
        ...userData,
        matchSettings: updatedMatchSettings,
      };
      setUserData(newUserData);

      if (onSave) {
        onSave(updatedData);
      }

      // CODE-ÄNDERUNG: searchImmediately prüfen und dann getMatch mit AKTUELLEN Daten aufrufen
      if (updatedMatchSettings.searchImmediately) {
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

        if (allCatsFilled) {
          console.log(
            "Starte Matching, da Kategorien vollständig und searchImmediately = true."
          );

          // CODE-ÄNDERUNG: Hier das aktualisierte newUserData an getMatch übergeben.
          await getMatch(newUserData);
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
          {errors.companies && (
            <p className="text-red-500 text-xs mt-1">{errors.companies}</p>
          )}

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
          {errors.positions && (
            <p className="text-red-500 text-xs mt-1">{errors.positions}</p>
          )}

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
          {errors.skills && (
            <p className="text-red-500 text-xs mt-1">{errors.skills}</p>
          )}

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
          {errors.industries && (
            <p className="text-red-500 text-xs mt-1">{errors.industries}</p>
          )}
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
