// components/ProfileSettingsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { useAuth } from "@/context/AuthContext";
import { useUserDataContext } from "@/context/UserDataProvider";

import { Loader2, Save } from "lucide-react";
import {
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkedAlt,
  FaLanguage,
} from "react-icons/fa";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

import { BirthDatePicker } from "../picker/BirthDatePicker";
import { User } from "@/models/user";

type LanguageSkill = {
  language: string;
  checked: boolean;
  level: string;
};

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: Partial<User>) => void;
}

const defaultLanguages = ["Deutsch", "Englisch", "Spanisch"];

const ProfileSettingsModal: React.FC<ProfileSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const { setUserData } = useUserDataContext();

  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("male");
  const [location, setLocation] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>(
    defaultLanguages.map((lang) => ({
      language: lang,
      checked: false,
      level: "",
    }))
  );
  const [isSaving, setIsSaving] = useState(false);

  // Laden der Daten beim Öffnen des Modals
  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const docRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const personalData = data.personalData || {};
        setBirthDate(personalData.birthDate || "");
        console.log(personalData.birthDate);
        setGender(personalData.gender || "male");
        setLocation(personalData.location || "");
        setPostalCode(personalData.postalCode || "");

        if (personalData.languageSkills) {
          const dbLanguageSkills: LanguageSkill[] = personalData.languageSkills;
          const merged = defaultLanguages.map((lang) => {
            const found = dbLanguageSkills.find(
              (item) => item.language === lang
            );
            return found
              ? found
              : { language: lang, checked: false, level: "" };
          });
          setLanguageSkills(merged);
        }
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const userRef = doc(db, "users", user.uid);
    const filteredLanguages = languageSkills.filter((ls) => ls.checked);

    await setDoc(
      userRef,
      {
        personalData: {
          birthDate,
          gender,
          location,
          postalCode,
          languageSkills: filteredLanguages,
        },
      },
      { merge: true }
    );

    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Persönliche Daten bearbeiten</DialogTitle>
          <DialogDescription>
            Passe deine Daten an und speichere die Änderungen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Geburtsdatum */}
          <div className="text-sm">
            <label className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FaBirthdayCake /> Geburtsdatum
            </label>
            <BirthDatePicker
              initialDate={birthDate ? new Date(birthDate) : undefined}
              onChange={(date: Date) => setBirthDate(date.toISOString())}
            />
          </div>

          {/* Geschlecht */}
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

          {/* Wohnort und PLZ */}
          <div className="flex gap-4">
            <div className="w-1/2 text-sm">
              <label className="text-sm font-semibold mb-2 flex items-center gap-1">
                <FaMapMarkedAlt /> Wohnort
              </label>
              <Input
                type="text"
                placeholder="z.B. Berlin"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="w-1/2 text-sm">
              <label className="text-sm font-semibold mb-2 flex items-center gap-1">
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

          {/* Sprachkenntnisse */}
          <div className="text-sm">
            <label className="text-sm font-semibold mb-3 flex items-center gap-1">
              <FaLanguage /> Sprachkenntnisse
            </label>
            <div className="flex flex-col gap-4">
              {languageSkills.map((ls, index) => (
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
                  {ls.checked && (
                    <div className="ml-6 mt-2">
                      <select
                        className="border border-gray-300 rounded px-2 py-1"
                        value={ls.level}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLanguageSkills((prev) => {
                            const newArr = [...prev];
                            newArr[index].level = value;
                            return newArr;
                          });
                        }}
                      >
                        <option value="">Level wählen</option>
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
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

export default ProfileSettingsModal;
