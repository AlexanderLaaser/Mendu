"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserDataContext } from "@/context/UserDataContext";
import { Offer } from "@/models/offers";
import CategorySetupSection from "@/components/elements/sections/CategorySetupSection";
import { categoryTitles } from "@/utils/categoryHandler";
import { Save } from "lucide-react";

interface ReferralModalProps {
  isOpen: boolean;
  editingOffer: Offer | null;
  onClose: () => void;
  onSave: (offer: Omit<Offer, "uid">) => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  editingOffer,
  onClose,
  onSave,
}) => {
  const { userData } = useUserDataContext();

  // Rolle ermitteln
  const userRole = userData?.role;
  const isInsider = userRole === "Insider";

  // [Inline Kommentar: Lokale States + Validierungs-Fehlermeldung]
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [referral, setReferral] = useState(""); // <-- Falls wir das Referral (Link) validieren möchten
  const [errorMessage, setErrorMessage] = useState(""); // <-- Neu für Validierungen

  const skillsSuggestionList =
    userData?.matchSettings?.categories.find(
      (cat) => cat.categoryName === "skills"
    )?.categoryEntries || [];

  // State für ausgewählte Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Company nur für Insider
  const company =
    userData?.matchSettings?.categories.find(
      (cat) => cat.categoryName === "companies"
    )?.categoryEntries[0] || "";

  // Mögliche Positionen
  const positions =
    userData?.matchSettings?.categories.find(
      (cat) => cat.categoryName === "positions"
    )?.categoryEntries || [];

  useEffect(() => {
    if (!isOpen) return;

    if (editingOffer) {
      setPosition(editingOffer.position || "");
      setDescription(editingOffer.description || "");
      setReferral(editingOffer.link || "");
      setSelectedSkills(editingOffer.skills || []);
    } else {
      setPosition("");
      setDescription("");
      setReferral("");
      // Voreinstellung: Skills mit allen Vorschlägen vom User
      setSelectedSkills(skillsSuggestionList);
    }
    // [Inline Kommentar: Fehlermeldung zurücksetzen, sobald das Modal geöffnet/geladen wird]
    setErrorMessage("");
  }, [isOpen, editingOffer, skillsSuggestionList]);

  // Dynamischer Dialogtitel
  const dialogTitle = editingOffer
    ? isInsider
      ? "Referral bearbeiten"
      : "Offer bearbeiten"
    : isInsider
    ? "Neues Referral"
    : "Neues Offer";

  const handleSave = async () => {
    // [Inline Kommentar: Validierung der wichtigsten Eingaben]
    if (!position) {
      setErrorMessage("Bitte wähle eine Position aus.");
      return;
    }

    if (!description) {
      setErrorMessage("Bitte füge eine Beschreibung hinzu.");
      return;
    }

    // [Inline Kommentar: Falls wir einen Link verlangen, kann man das validieren]
    // if (isInsider && !referral) {
    //   setErrorMessage("Bitte füge einen Referral-Link hinzu.");
    //   return;
    // }

    if (!userData?.uid) {
      setErrorMessage("Es ist kein Benutzer angemeldet.");
      console.error("User ID fehlt!");
      return;
    }

    // Maximale 100 Wörter in der Beschreibung
    const wordLimit = 100;
    const words = description.split(/\s+/).slice(0, wordLimit);
    const limitedDescription = words.join(" ");

    const offerData: Omit<Offer, "uid"> = {
      id: editingOffer?.id || "",
      userRole: userRole,
      company: isInsider ? company : "",
      position,
      description: limitedDescription,
      link: referral,
      skills: selectedSkills,
      firstNameCreator: userData?.personalData?.firstName || "",
      leadershipLevel: userData?.matchSettings?.leadershipLevel || "",
    };

    onSave(offerData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Bitte fülle alle Pflichtfelder aus, um dein{" "}
            {isInsider ? "Referral" : "Offer"}{" "}
            {editingOffer ? "zu bearbeiten" : "hinzuzufügen"}.
          </DialogDescription>
        </DialogHeader>

        {/* [Inline Kommentar: Fehlermeldung anzeigen, wenn vorhanden] */}
        {errorMessage && (
          <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
        )}

        <div className="space-y-4">
          {/* Nur für Insider: Aktueller Arbeitgeber */}
          {isInsider && (
            <div>
              <label className="block mb-2 text-sm font-medium">
                Aktueller Arbeitgeber:
              </label>
              <div className="p-2 border rounded bg-gray-100 font-sm">
                {company}
              </div>
            </div>
          )}

          {/* Positions-Auswahl */}
          <div>
            <label className="block mb-2 text-sm font-medium">Position:</label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wähle eine Position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Beschreibung (max. 100 Wörter):
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Referral-Link (falls benötigt) */}
          {isInsider && (
            <div>
              <label className="block mb-2 text-sm font-medium">
                Referral-Link:
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
              />
            </div>
          )}

          <CategorySetupSection
            title={
              isInsider
                ? categoryTitles.Insider.skills
                : categoryTitles.Talent.skills
            }
            categoryName="skills"
            initialTags={selectedSkills}
            onTagsChange={(tags) => setSelectedSkills(tags)}
            mode="active"
          />
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralModal;
