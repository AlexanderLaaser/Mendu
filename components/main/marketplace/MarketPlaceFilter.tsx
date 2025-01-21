"use client";

import React, { useState, useEffect } from "react";
import { Offer } from "@/models/offers";
import { useUserDataContext } from "@/context/UserDataProvider";
// Importiere Shadcn-UI-Komponenten
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MarketplaceFilterProps {
  Offer?: Offer; // Optionales Offer, um Standardposition zu entnehmen
  onFilterChange?: (filters: {
    skills: string[];
    position: string;
    branchen: string[];
  }) => void;
}

export default function MarketplaceFilter({
  Offer,
  onFilterChange,
}: MarketplaceFilterProps) {
  const { userData } = useUserDataContext();

  // Initialisiere den Standardwert der Position anhand des Offer
  const [selectedPosition, setSelectedPosition] = useState<string>(
    Offer?.position || ""
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedBranchen, setSelectedBranchen] = useState<string[]>([]);

  // Beispielhafte Anpassung: Annahme, dass Kategorien Skills, Positionen und Branchen enthalten
  const skillsCategory = userData?.matchSettings?.categories.find(
    (cat) => cat.categoryName === "skills"
  );
  const positionsCategory = userData?.matchSettings?.categories.find(
    (cat) => cat.categoryName === "positions"
  );
  const industriesCategory = userData?.matchSettings?.categories.find(
    (cat) => cat.categoryName === "industries"
  );

  const availableSkills: string[] = skillsCategory?.categoryEntries || [];
  const availablePositions: string[] = positionsCategory?.categoryEntries || [];
  const availableBranchen: string[] = industriesCategory?.categoryEntries || [];

  useEffect(() => {
    // Informiere bei Änderungen der Filter über die Callback-Funktion
    if (onFilterChange) {
      onFilterChange({
        skills: selectedSkills,
        position: selectedPosition,
        branchen: selectedBranchen,
      });
    }
  }, [selectedSkills, selectedPosition, selectedBranchen, onFilterChange]);

  return (
    <div>
      <h3 className="mb-4 text-xl">Filter</h3>
      {/* Skills Checkboxen */}
      <div className="mb-6">
        <Label className="block text-sm font-semibold mb-2">Skills:</Label>
        <div className="space-y-2">
          {availableSkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSkills((prev) => [...prev, skill]);
                  } else {
                    setSelectedSkills((prev) =>
                      prev.filter((s) => s !== skill)
                    );
                  }
                }}
              />
              <Label htmlFor={`skill-${skill}`} className="text-sm">
                {skill}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Positions Checkboxen */}
      <div className="mb-6">
        <Label className="block text-sm font-semibold mb-2">Position:</Label>
        <div className="space-y-2">
          {availablePositions.map((pos) => (
            <div key={pos} className="flex items-center space-x-2">
              <Checkbox
                id={`position-${pos}`}
                checked={selectedPosition === pos}
                onCheckedChange={(checked) => {
                  // Nur eine Position kann gleichzeitig ausgewählt sein
                  setSelectedPosition(checked ? pos : "");
                }}
              />
              <Label htmlFor={`position-${pos}`} className="text-sm">
                {pos}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Branchen Checkboxen */}
      <div className="mb-6">
        <Label className="block text-sm font-semibold mb-2">Branchen:</Label>
        <div className="space-y-2">
          {availableBranchen.map((branche) => (
            <div key={branche} className="flex items-center space-x-2">
              <Checkbox
                id={`branche-${branche}`}
                checked={selectedBranchen.includes(branche)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBranchen((prev) => [...prev, branche]);
                  } else {
                    setSelectedBranchen((prev) =>
                      prev.filter((b) => b !== branche)
                    );
                  }
                }}
              />
              <Label htmlFor={`branche-${branche}`} className="text-sm">
                {branche}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
