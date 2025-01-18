/// ReferralModal.tsx
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
} from "@/components/ui/select"; // Annahme: Shadcn Select-Komponenten-Pfade
import { useUserDataContext } from "@/context/UserDataProvider";

interface ReferralModalProps {
  isOpen: boolean;
  initialPosition?: string;
  initialDescription?: string;
  initialReferral?: string;
  onClose: () => void;
  onSave: (
    company: string,
    position: string,
    description: string,
    referral: string
  ) => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  initialPosition = "",
  initialDescription = "",
  initialReferral = "",
  onClose,
  onSave,
}) => {
  const { userData } = useUserDataContext();

  const [position, setPosition] = useState(initialPosition);
  const [description, setDescription] = useState(initialDescription);
  const [referral, setReferral] = useState(initialReferral);

  useEffect(() => {
    setPosition(initialPosition);
    setDescription(initialDescription);
    setReferral(initialReferral);
  }, [initialPosition, initialDescription, initialReferral]);

  const company =
    userData?.matchSettings?.categories.find(
      (cat) => cat.categoryName === "companies"
    )?.categoryEntries[0] || "";

  const positions =
    userData?.matchSettings?.categories.find(
      (cat) => cat.categoryName === "positions"
    )?.categoryEntries || [];

  const handleSave = () => {
    const wordLimit = 100;
    const words = description.split(/\s+/).slice(0, wordLimit);
    const limitedDescription = words.join(" ");

    onSave(company, position, limitedDescription, referral);
    setPosition("");
    setDescription("");
    setReferral("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {company ? "Referral bearbeiten" : "Neues Referral"}
          </DialogTitle>
          <DialogDescription>
            Bitte fülle alle Pflichtfelder aus, um dein Referral{" "}
            {company ? "zu bearbeiten" : "hinzuzufügen"}.
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
            {/* Verwendung des Shadcn Select-Komponenten-Patterns */}
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
              Referral-Link (optional):
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
