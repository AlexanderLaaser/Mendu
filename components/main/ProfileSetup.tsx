"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/authContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import { companyList, industryInterests, positions } from "@/utils/dataSets";
import CategorySetupSection from "../sections/CategorySetupSection";

const ProfileSetupPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Schaltet zwischen Step 1 (Basis-Infos) und Step 2 (Role-spezifische Ansicht) um
  const [step, setStep] = useState(1);

  // Formulardaten Step 1
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("male");
  const [role, setRole] = useState<"Talent" | "Insider" | "">("");

  // Tags-State für Talent-Setup (companies, industries, positions)
  const [categories, setCategories] = useState<{
    companies: string[];
    industries: string[];
    positions: string[];
  }>({
    companies: [],
    industries: [],
    positions: [],
  });

  // Funktion zum Aktualisieren der Tags in unserem lokalen State
  const handleChange = (categoryName: string, tags: string[]) => {
    setCategories((prev) => ({
      ...prev,
      [categoryName]: tags,
    }));
  };

  // Falls der User nicht eingeloggt ist oder noch lädt, kann man erst mal einen Loading State zeigen
  if (loading) {
    return <div>Lade...</div>;
  }
  if (!user) {
    // Wenn kein User eingeloggt, zurück zur Login-Seite
    router.push("/login");
    return null;
  }

  // Funktion, um Setup-Daten zu speichern und setupComplete auf true zu setzen
  const handleSaveSetup = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    // Optional könnten Sie hier gleich die `categories` mitschicken,
    // um Firmen/Branchen/Positionen in Firestore zu speichern
    await updateDoc(userRef, {
      setupComplete: true,
      birthDate,
      gender,
      role,
      // matchSettings für alle User
      ...{
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
      },
    });
    router.push("/dashboard");
  };

  // -----------------------------------------
  // RENDERING STEP 1 (Basis-Informationen)
  // -----------------------------------------
  const renderStep1 = () => {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">Basis-Informationen</h2>

        {/* Geburtsdatum */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Geburtsdatum</label>
          <input
            type="date"
            className="input input-bordered"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        {/* Geschlecht */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Geschlecht</label>
          <select
            className="select select-bordered"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
            <option value="diverse">Divers</option>
          </select>
        </div>

        {/* Art der Anmeldung */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Art der Anmeldung
          </label>
          <select
            className="select select-bordered"
            value={role}
            onChange={(e) => setRole(e.target.value as "Talent" | "Insider")}
          >
            <option value="">Bitte wählen</option>
            <option value="Talent">Talent</option>
            <option value="Insider">Insider</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!role) {
                alert("Bitte Rolle auswählen");
                return;
              }
              setStep(2);
            }}
          >
            Weiter
          </button>
        </div>
      </div>
    );
  };

  // -----------------------------------------
  // RENDERING STEP 2 (Talent vs. Insider)
  // -----------------------------------------
  const renderStep2 = () => {
    if (role === "Talent") {
      return (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">Talent-Setup</h2>

          <div className="max-h-[70vh] overflow-y-auto pb-24">
            {/* Beispiel für Firmen (companies) im aktiven Modus */}
            <CategorySetupSection
              title="An welchen Firmen bist du interessiert?"
              categoryName="companies"
              dataList={companyList}
              initialTags={categories.companies}
              onTagsChange={(tags) => handleChange("companies", tags)}
              mode="active"
            />

            {/* Branchen (industries) im aktiven Modus */}
            <CategorySetupSection
              title="Welche Branchen sind für Dich relevant?"
              categoryName="industries"
              dataList={industryInterests}
              initialTags={categories.industries}
              onTagsChange={(tags) => handleChange("industries", tags)}
              mode="active"
            />

            {/* Positionen (positions) im aktiven Modus */}
            <CategorySetupSection
              title="An welchen Positionen bist du besonders interessiert?"
              categoryName="positions"
              dataList={positions}
              initialTags={categories.positions}
              onTagsChange={(tags) => handleChange("positions", tags)}
              mode="active"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="btn btn-secondary mr-2"
              onClick={() => setStep(1)}
            >
              Zurück
            </button>
            <button className="btn btn-primary" onClick={handleSaveSetup}>
              Setup abschließen
            </button>
          </div>
        </div>
      );
    }

    // Wenn "Insider"
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Insider-Setup</h2>
        <div className="max-h-[70vh] overflow-y-auto pb-24">
          {/* Beispiel für Firmen (companies) im aktiven Modus */}
          <CategorySetupSection
            title="Nenne uns deinen aktuellen Arbeitgeber:"
            categoryName="companies"
            dataList={companyList}
            initialTags={categories.companies}
            onTagsChange={(tags) => handleChange("companies", tags)}
            mode="active"
            singleSelection={true}
          />

          {/* Branchen (industries) im aktiven Modus */}
          <CategorySetupSection
            title="In welchen Branchen bist du tätig?"
            categoryName="industries"
            dataList={industryInterests}
            initialTags={categories.industries}
            onTagsChange={(tags) => handleChange("industries", tags)}
            mode="active"
          />

          {/* Positionen (positions) im aktiven Modus */}
          <CategorySetupSection
            title="Wie lautet deine aktuelle Position?"
            categoryName="positions"
            dataList={positions}
            initialTags={categories.positions}
            onTagsChange={(tags) => handleChange("positions", tags)}
            mode="active"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn btn-secondary mr-2" onClick={() => setStep(1)}>
            Zurück
          </button>
          <button className="btn btn-primary" onClick={handleSaveSetup}>
            Setup abschließen
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded shadow p-4 w-full max-w-xl">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
};

export default ProfileSetupPage;
