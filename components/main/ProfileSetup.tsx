"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import { companyList, industryInterests, positions } from "@/utils/dataSets";
import CategorySetupSection from "../sections/CategorySetupSection";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useUserDataContext } from "@/context/UserDataProvider";

const ProfileSetup: React.FC = () => {
  const { user, loading } = useAuth();
  const { setUserData } = useUserDataContext();
  const [step, setStep] = useState(1);

  // -- Formulardaten Step 1
  // Persönliche Daten: Geburtsdatum, Geschlecht, Rolle
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("male");
  const [role, setRole] = useState<"Talent" | "Insider" | "">("");

  // Neue Felder:
  const [searchImmediately, setSearchImmediately] = useState(false);
  const [furtherCompaniesRecommended, setFurtherCompaniesRecommended] =
    useState(false);

  // -- Step 2: Categories (companies, industries, positions)
  const [categories, setCategories] = useState<{
    companies: string[];
    industries: string[];
    positions: string[];
  }>({
    companies: [],
    industries: [],
    positions: [],
  });

  // ---------------------------
  // Basic loading/auth check
  // ---------------------------
  if (loading) {
    return <div className="p-4">Lade...</div>;
  }

  // ---------------------------
  // Handler zum Aktualisieren der Tags
  // ---------------------------
  const handleCategoryChange = (categoryName: string, tags: string[]) => {
    setCategories((prev) => ({
      ...prev,
      [categoryName]: tags,
    }));
  };

  // ---------------------------
  // Progress-Bar Komponente
  // ---------------------------
  const ProgressBar: React.FC<{ step: number }> = ({ step }) => {
    const progress = step === 1 ? 50 : 100;

    return (
      <div className="w-full bg-gray-200 h-2 rounded-full mb-4 overflow-hidden">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const handleSaveSetup = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    // WICHTIG: setDoc(..., { merge: true }) => vorhandene Felder werden NICHT überschrieben
    await setDoc(
      userRef,
      {
        role,
        setupComplete: true,
        personalData: {
          birthDate: birthDate,
          gender: gender,
        },
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
          searchImmediately: searchImmediately,
          furtherCompaniesRecommended: furtherCompaniesRecommended,
        },
      },
      { merge: true }
    );
    // Hier: Lokalen State im Hook updaten
    setUserData((prev) => ({
      ...prev,
      setupComplete: true,
    }));
  };

  // -----------------------------------------
  // STEP 1 - Persönliche Informationen
  // -----------------------------------------
  const renderStep1 = () => {
    return (
      <div className="font-montserrat space-y-8">
        <h2 className="text-xl font-bold">Persönliche Informationen</h2>

        {/* Geburtsdatum */}
        <div className="text-sm">
          <label className="block text-sm font-semibold mb-1">
            Geburtsdatum
          </label>
          <input
            type="date"
            className="input input-bordered w-full text-sm"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        {/* Geschlecht -> Radio Buttons */}
        <div>
          <label className="block text-sm font-semibold mb-1">Geschlecht</label>
          <div className="flex gap-4 text-sm">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                className="radio radio-primary"
                value="male"
                checked={gender === "male"}
                onChange={() => setGender("male")}
              />
              <span>Männlich</span>
            </label>

            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                className="radio radio-primary"
                value="female"
                checked={gender === "female"}
                onChange={() => setGender("female")}
              />
              <span>Weiblich</span>
            </label>

            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                className="radio radio-primary"
                value="diverse"
                checked={gender === "diverse"}
                onChange={() => setGender("diverse")}
              />
              <span>Divers</span>
            </label>
          </div>
        </div>

        {/* Art der Anmeldung -> Radio Buttons */}
        <div className="mt-4 text-sm">
          <label className="block text-sm font-semibold mb-1">
            Art der Anmeldung
          </label>
          <div className="flex gap-4">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="role"
                className="radio radio-primary"
                value="Talent"
                checked={role === "Talent"}
                onChange={() => setRole("Talent")}
              />
              <span>Talent</span>
            </label>

            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="role"
                className="radio radio-primary "
                value="Insider"
                checked={role === "Insider"}
                onChange={() => setRole("Insider")}
              />
              <span>Insider</span>
            </label>
          </div>

          {/* Info-Text in Orange */}
          <div className="bg-orange-100 text-orange-700 p-2 mt-2 rounded flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 text-orange-700 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9 2a7 7 0 100 14A7 7 0 009 2zM8 7h2v3H8V7zm0 4h2v2H8v-2z"
                fillRule="evenodd"
              />
            </svg>
            <span className="text-sm">
              <strong>Talent:</strong> Du bist auf Jobsuche und möchtest dich
              vermitteln lassen.
              <br />
              <strong>Insider:</strong> Du arbeitest bereits in einem
              Unternehmen und kannst andere Talente empfehlen.
            </span>
          </div>
        </div>

        {/* Weitere Firmen empfohlen bekommen? -> nur wenn Talent */}
        {role === "Talent" && (
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">
              Weitere Firmen empfohlen bekommen?
            </label>
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={furtherCompaniesRecommended}
                onChange={(e) =>
                  setFurtherCompaniesRecommended(e.target.checked)
                }
              />
              <span className="text-sm">
                Ja, ich möchte weitere passende Firmenvorschläge erhalten
              </span>
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {/* Weiter Button mit Pfeil */}
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {
              if (!role) {
                alert("Bitte Rolle auswählen");
                return;
              }
              setStep(2);
            }}
          >
            Weiter
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // -----------------------------------------
  // STEP 2 - Berufliche Details
  // -----------------------------------------
  const renderStep2 = () => {
    const isTalent = role === "Talent";
    const heading = isTalent
      ? "Berufliche Details (Talent)"
      : "Berufliche Details (Insider)";
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-bold mb-2">{heading}</h2>

        <div className="max-h-[60vh] overflow-y-auto">
          {isTalent ? (
            <>
              <CategorySetupSection
                title="An welchen Firmen bist du interessiert?"
                categoryName="companies"
                dataList={companyList}
                initialTags={categories.companies}
                onTagsChange={(tags) => handleCategoryChange("companies", tags)}
                mode="active"
              />
              <CategorySetupSection
                title="Welche Branchen sind für dich relevant?"
                categoryName="industries"
                dataList={industryInterests}
                initialTags={categories.industries}
                onTagsChange={(tags) =>
                  handleCategoryChange("industries", tags)
                }
                mode="active"
              />
              <CategorySetupSection
                title="An welchen Positionen bist du besonders interessiert?"
                categoryName="positions"
                dataList={positions}
                initialTags={categories.positions}
                onTagsChange={(tags) => handleCategoryChange("positions", tags)}
                mode="active"
              />
            </>
          ) : (
            <>
              <CategorySetupSection
                title="Nenne uns deinen aktuellen Arbeitgeber:"
                categoryName="companies"
                dataList={companyList}
                initialTags={categories.companies}
                onTagsChange={(tags) => handleCategoryChange("companies", tags)}
                mode="active"
                singleSelection={true}
              />
              <CategorySetupSection
                title="In welchen Branchen bist du tätig?"
                categoryName="industries"
                dataList={industryInterests}
                initialTags={categories.industries}
                onTagsChange={(tags) =>
                  handleCategoryChange("industries", tags)
                }
                mode="active"
              />
              <CategorySetupSection
                title="Wie lautet deine aktuelle Position?"
                categoryName="positions"
                dataList={positions}
                initialTags={categories.positions}
                onTagsChange={(tags) => handleCategoryChange("positions", tags)}
                mode="active"
              />
            </>
          )}
        </div>

        <div className="text-sm">
          <label className="block text-sm font-semibold mb-1">
            Suche sofort starten?
          </label>
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={searchImmediately}
              onChange={(e) => setSearchImmediately(e.target.checked)}
            />
            <span>Ja, direkt nach passenden Matches suchen</span>
          </label>
        </div>

        <div className="mt-6 flex justify-between">
          {/* Zurück Button mit Pfeil */}
          <button
            className="btn btn-secondary flex items-center gap-2 hover:bg-secondary transition-colors"
            onClick={() => setStep(1)}
          >
            <FaArrowLeft className="w-4 h-4" />
            Zurück
          </button>

          {/* Setup abschließen */}
          <button className="btn btn-primary" onClick={handleSaveSetup}>
            Setup abschließen
          </button>
        </div>
      </div>
    );
  };

  // -----------------------------------------
  // Haupt-Return: Layout / Container
  // -----------------------------------------
  return (
    <div className="font-montserrat max-w-xl mx-auto border rounded-md shadow-lg">
      {/* Progress-Bar */}
      <div className="p-4">
        <ProgressBar step={step} />
      </div>

      <div className="px-4 pb-4">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
};

export default ProfileSetup;
