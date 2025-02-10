"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import CategorySetupSection from "../../../elements/sections/CategorySetupSection";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkedAlt,
  FaLanguage,
  FaUserTie,
  FaSuitcase,
} from "react-icons/fa";
import { useUserDataContext } from "@/context/UserDataContext";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Checkbox } from "../../../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { BirthDatePicker } from "@/components/elements/picker/BirthDatePicker";
import { User } from "@/models/user";

type LanguageSkill = {
  language: string;
  checked: boolean;
  level: string;
};

const defaultLanguages = ["Deutsch", "Englisch", "Spanisch"];

const Setup: React.FC = () => {
  const { user, loading } = useAuth();
  const { userData, setUserData } = useUserDataContext();
  const [step, setStep] = useState(1);

  // -- Formulardaten Step 1
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("male");
  const [role, setRole] = useState<"Talent" | "Insider">("Talent");

  const [searchImmediately, setSearchImmediately] = useState(false);
  const [furtherCompaniesRecommended, setFurtherCompaniesRecommended] =
    useState(false);

  // Wohnort + Postleitzahl
  const [location, setLocation] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Sprachkenntnisse
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>(
    defaultLanguages.map((lang) => ({
      language: lang,
      checked: false,
      level: "",
    }))
  );

  // Step 2 Kategorien
  const [categories, setCategories] = useState<{
    companies: string[];
    industries: string[];
    positions: string[];
    skills: string[];
  }>({
    companies: [],
    industries: [],
    positions: [],
    skills: [],
  });

  // Leitungsebene
  const [leadershipLevel, setLeadershipLevel] = useState<string>("");

  if (loading) {
    return <div className="p-4">Lade...</div>;
  }

  const handleCategoryChange = (categoryName: string, tags: string[]) => {
    setCategories((prev) => ({
      ...prev,
      [categoryName]: tags,
    }));
  };

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

    // -- Sprachkenntnisse nur die ausgewählten
    const filteredLanguages = languageSkills.filter((ls) => ls.checked);

    // -- (1) Objekt mit allen neuen Daten vorbereiten
    const updatedUserData: Partial<User> = {
      role,
      setupComplete: true,
      personalData: {
        birthDate,
        gender,
        location,
        postalCode,
        languages: filteredLanguages,
        firstName: userData.personalData?.firstName,
        lastName: userData.personalData?.lastName,
        email: userData.personalData?.email,
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
          {
            categoryName: "skills",
            categoryEntries: categories.skills,
          },
        ],
        searchImmediately,
        furtherCompaniesRecommended,
        leadershipLevel,
      },
    };

    // -- (2) Daten in Firestore speichern
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, updatedUserData, { merge: true });

    // -- (3) Lokalen User-State sofort updaten,
    //        damit die Änderungen sofort verfügbar sind.
    setUserData((prev) => ({
      ...prev,
      ...updatedUserData,
    }));
  };

  const renderStep1 = () => {
    return (
      <div className="font-montserrat space-y-8">
        <h2 className="text-xl flex items-center gap-2">
          Persönliche Informationen
        </h2>

        <div className="text-sm">
          <label className="text-sm font-semibold mb-2 flex items-center gap-1">
            <FaBirthdayCake /> Geburtsdatum
          </label>
          <BirthDatePicker
            onChange={(date: Date) => setBirthDate(date.toISOString())}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-3 flex items-center gap-1">
            <FaVenusMars /> Geschlecht
          </label>
          <RadioGroup
            className="flex gap-4 text-sm"
            value={gender}
            onValueChange={(val) => setGender(val)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <label htmlFor="gender-male" className="cursor-pointer">
                Männlich
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <label htmlFor="gender-female" className="cursor-pointer">
                Weiblich
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="diverse" id="gender-diverse" />
              <label htmlFor="gender-diverse" className="cursor-pointer">
                Divers
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2 text-sm">
            <label className="block text-sm font-semibold mb-2 items-center gap-1">
              <FaMapMarkedAlt /> Wohnort
            </label>
            <Input
              type="text"
              placeholder="Stadt oder Region ..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="w-1/2 text-sm">
            <label className="block text-sm font-semibold mb-2 items-center gap-1">
              <FaMapMarkedAlt /> PLZ
            </label>
            <Input
              type="text"
              placeholder="12345"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
        </div>

        <div className="text-sm">
          <label className="text-sm font-semibold mb-3 flex items-center gap-1">
            <FaLanguage /> Sprachkenntnisse
          </label>
          <div className="flex flex-col gap-4">
            {languageSkills.map((ls, index) => {
              const isChecked = ls.checked;
              return (
                <div key={ls.language}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${ls.language}`}
                      checked={ls.checked}
                      onCheckedChange={(checked) => {
                        setLanguageSkills((prev) => {
                          const newArr = [...prev];
                          newArr[index].checked = Boolean(checked);
                          if (!checked) {
                            newArr[index].level = "";
                          }
                          return newArr;
                        });
                      }}
                    />
                    <label
                      htmlFor={`lang-${ls.language}`}
                      className="cursor-pointer"
                    >
                      {ls.language}
                    </label>
                  </div>
                  {isChecked && (
                    <div className="ml-6 mt-2">
                      <Select
                        value={ls.level}
                        onValueChange={(value) => {
                          setLanguageSkills((prev) => {
                            const newArr = [...prev];
                            newArr[index].level = value;
                            return newArr;
                          });
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A1">A1</SelectItem>
                          <SelectItem value="A2">A2</SelectItem>
                          <SelectItem value="B1">B1</SelectItem>
                          <SelectItem value="B2">B2</SelectItem>
                          <SelectItem value="C1">C1</SelectItem>
                          <SelectItem value="C2">C2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-sm">
          <div className="flex flex-row">
            <label className="block text-sm font-semibold mb-2">Typ</label>
          </div>

          <RadioGroup
            className="flex gap-4"
            value={role}
            onValueChange={(val: "Talent" | "Insider") => setRole(val)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Talent" id="role-talent" />
              <label htmlFor="role-talent" className="cursor-pointer">
                Talent
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Insider" id="role-insider" />
              <label htmlFor="role-insider" className="cursor-pointer">
                Insider
              </label>
            </div>
          </RadioGroup>
          <div className="bg-orange-100 text-orange-700 p-2 rounded flex items-start gap-2 mt-3 text-sm">
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
            <span>
              <strong>Talent:</strong> Du bist an bestimmten Unternehmen
              interessiert und möchtest von persönlichen Empfehlungen
              profitieren.
              <br />
              <strong>Insider:</strong> Du arbeitest bereits in einem
              Unternehmen und kannst andere Talente empfehlen, um vom
              Empfehlungsbonus zu profitieren.
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="flex items-center gap-2"
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
          </Button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const isTalent = role === "Talent";
    const headingIcon = isTalent ? <FaSuitcase /> : <FaUserTie />;
    const heading = isTalent
      ? "Berufliche Details (Talent)"
      : "Berufliche Details (Insider)";

    return (
      <div className="space-y-8">
        <h2 className="text-xl flex items-center gap-2">{heading}</h2>

        <div className="max-h-[60vh] overflow-y-auto">
          {isTalent ? (
            <>
              <CategorySetupSection
                title="An welchen Firmen bist du interessiert?"
                categoryName="companies"
                initialTags={categories.companies}
                onTagsChange={(tags) => handleCategoryChange("companies", tags)}
                mode="active"
              />

              <CategorySetupSection
                title="An welchen Positionen bist du besonders interessiert?"
                categoryName="positions"
                initialTags={categories.positions}
                onTagsChange={(tags) => handleCategoryChange("positions", tags)}
                mode="active"
              />

              <CategorySetupSection
                title="Welche Branchen sind für dich relevant?"
                categoryName="industries"
                initialTags={categories.industries}
                onTagsChange={(tags) =>
                  handleCategoryChange("industries", tags)
                }
                mode="active"
              />

              <div className="mt-4 text-sm ">
                <div className="flex flex-row gap-2">
                  {headingIcon}
                  <label className="block text-sm font-semibold mb-3">
                    Auf welchem Level möchtest du einsteigen?
                  </label>
                </div>

                <RadioGroup
                  className="flex gap-4"
                  value={leadershipLevel}
                  onValueChange={(val) => setLeadershipLevel(val)}
                >
                  {["Junior", "Mid-Level", "Senior"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level} id={`lead-${level}`} />
                      <label
                        htmlFor={`lead-${level}`}
                        className="cursor-pointer"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <CategorySetupSection
                title="Mit welchen Technologien möchtest du arbeiten?"
                categoryName="skills"
                initialTags={categories.skills}
                onTagsChange={(tags) => handleCategoryChange("skills", tags)}
                mode="active"
              />
            </>
          ) : (
            <>
              <CategorySetupSection
                title="Nenne uns deinen aktuellen Arbeitgeber:"
                categoryName="companies"
                initialTags={categories.companies}
                onTagsChange={(tags) => handleCategoryChange("companies", tags)}
                mode="active"
                singleSelection={true}
              />
              <CategorySetupSection
                title="In welchen Positionen konntest du bereits Erfahrung sammeln?"
                categoryName="positions"
                initialTags={categories.positions}
                onTagsChange={(tags) => handleCategoryChange("positions", tags)}
                mode="active"
              />

              <CategorySetupSection
                title="In welchen Branchen bist/warst du bereits tätig?"
                categoryName="industries"
                initialTags={categories.industries}
                onTagsChange={(tags) =>
                  handleCategoryChange("industries", tags)
                }
                mode="active"
              />

              <div className="mt-4 text-sm">
                <label className="block text-sm font-semibold mb-2">
                  Auf welchem Level bist du aktuell aktiv?
                </label>
                <RadioGroup
                  className="flex gap-4"
                  value={leadershipLevel}
                  onValueChange={(val) => setLeadershipLevel(val)}
                >
                  {["Junior", "Mid-Level", "Senior"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level} id={`lead-${level}`} />
                      <label
                        htmlFor={`lead-${level}`}
                        className="cursor-pointer"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <CategorySetupSection
                title="Welche Tools, Technologien oder Skills kommen in deinem Beruf zum Einsatz?"
                categoryName="skills"
                initialTags={categories.skills}
                onTagsChange={(tags) => handleCategoryChange("skills", tags)}
                mode="active"
              />
            </>
          )}
        </div>

        {isTalent && (
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">
              Weitere Firmen empfohlen bekommen?
            </label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="further-companies"
                checked={furtherCompaniesRecommended}
                onCheckedChange={(checked) =>
                  setFurtherCompaniesRecommended(Boolean(checked))
                }
              />
              <label
                htmlFor="further-companies"
                className="cursor-pointer text-sm"
              >
                Ja, ich möchte weitere passende Firmenvorschläge erhalten
              </label>
            </div>
          </div>
        )}

        <div className="text-sm">
          <label className="block text-sm font-semibold mb-1">
            Suche sofort starten?
          </label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="search-immediately"
              checked={searchImmediately}
              onCheckedChange={(checked) =>
                setSearchImmediately(Boolean(checked))
              }
            />
            <label htmlFor="search-immediately" className="cursor-pointer">
              Ja, direkt nach passenden Matches suchen
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button
            variant="secondary"
            className="flex items-center gap-2 hover:bg-secondary transition-colors"
            onClick={() => setStep(1)}
          >
            <FaArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
          <Button onClick={handleSaveSetup}>Setup abschließen</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="font-montserrat max-w-xl mx-auto border-none rounded-md">
      <div className="p-4">
        <ProgressBar step={step} />
      </div>
      <div className="px-4 pb-4">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
};

export default Setup;
