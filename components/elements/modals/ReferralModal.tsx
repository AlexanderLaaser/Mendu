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
import { useUserDataContext } from "@/context/UserDataProvider";
import { Offer } from "@/models/offers";

interface ReferralModalProps {
  isOpen: boolean;
  editingOffer: Offer | null; // CHANGE: Bisherige initial-Props entfernt und durch ein Offer ersetzt
  onClose: () => void;
  onSave: (
    // CHANGE: onSave erwartet ein Objekt ohne uid, da uid erst im Parent angehängt wird
    offer: Omit<Offer, "uid">
  ) => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  editingOffer,
  onClose,
  onSave,
}) => {
  const { userData } = useUserDataContext();

  // CHANGE: Lokale States werden aus dem editingOffer initialisiert
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [referral, setReferral] = useState("");

  // CHANGE: company holen wir dynamisch aus userData
  const company =
    userData?.matchSettings?.categories.find(
      (cat) => cat.categoryName === "companies"
    )?.categoryEntries[0] || "";

  // CHANGE: mögliche Positions
  const positions =
    userData?.matchSettings?.categories.find(
      (cat) => cat.categoryName === "positions"
    )?.categoryEntries || [];

  const skills =
    userData?.matchSettings?.categories
      .find((cat) => cat.categoryName === "skills")
      ?.categoryEntries.map((entry) => entry) || [];

  const userRole = userData?.role;

  // CHANGE: Effekt zum Aktualisieren, falls editingOffer wechselt
  useEffect(() => {
    if (editingOffer) {
      setPosition(editingOffer.position);
      setDescription(editingOffer.description);
      setReferral(editingOffer.link);
    } else {
      setPosition("");
      setDescription("");
      setReferral("");
    }
  }, [editingOffer]);

  const handleSave = () => {
    const wordLimit = 100;
    const words = description.split(/\s+/).slice(0, wordLimit);
    const limitedDescription = words.join(" ");

    // CHANGE: Wir geben das Objekt ohne uid nach oben
    onSave({
      id: editingOffer?.id || "",
      userRole: userRole,
      company: company,
      position,
      description: limitedDescription,
      link: referral,
      skills: skills,
      firstNameCreator: userData?.personalData.firstName,
      leadershipLevel: userData?.matchSettings.leadershipLevel,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingOffer ? "Referral bearbeiten" : "Neues Referral"}
          </DialogTitle>
          <DialogDescription>
            Bitte fülle alle Pflichtfelder aus, um dein Referral{" "}
            {editingOffer ? "zu bearbeiten" : "hinzuzufügen"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Aktueller Arbeitgeber:
            </label>
            <div className="p-2 border rounded bg-gray-100 font-sm">
              {company}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Position:</label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wähle eine Position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos, idx) => (
                  <SelectItem key={idx} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div>
            <label className="block mb-2 text-sm font-medium">
              Link (optional):
            </label>
            <input
              type="text"
              className="input input-bordered w-full font-sm"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button onClick={handleSave}>Abschließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralModal;
