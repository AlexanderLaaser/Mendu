"use client";
import React, { useState, useEffect } from "react";
import { Offer } from "@/models/offers";
import { useUserDataContext } from "@/context/UserDataContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MarketplaceFilterProps {
  onFilterChange?: (filters: {
    skills: string[];
    positions: string[];
    branchen: string[];
    companies: string[];
  }) => void;
  disabled?: boolean;
}

export default function MarketplaceFilter({
  onFilterChange,
  disabled = false,
}: MarketplaceFilterProps) {
  const { userData } = useUserDataContext();
  const isTalent = userData?.role === "Talent";

  // Alle hier beginnen **leer**, damit anfangs keine Filter aktiv sind.
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedBranchen, setSelectedBranchen] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Kategorien aus userData holen
  const skillsCategory = userData?.matchSettings?.categories.find(
    (cat) => cat.categoryName === "skills"
  );
  const positionsCategory = userData?.matchSettings?.categories.find(
    (cat) => cat.categoryName === "positions"
  );
  const industriesCategory = userData?.matchSettings?.categories.find(
    (cat) => cat.categoryName === "industries"
  );
  const companiesCategory = userData?.matchSettings?.categories.find(
    (cat) => cat.categoryName === "companies"
  );

  const availableSkills: string[] = skillsCategory?.categoryEntries || [];
  const availablePositions: string[] = positionsCategory?.categoryEntries || [];
  const availableBranchen: string[] = industriesCategory?.categoryEntries || [];
  const availableCompanies: string[] = companiesCategory?.categoryEntries || [];

  // Immer wenn sich irgendeine Auswahl ändert, rufen wir das Callback auf
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        positions: selectedPositions,
        skills: selectedSkills,
        branchen: selectedBranchen,
        companies: selectedCompanies,
      });
    }
  }, [
    onFilterChange,
    selectedPositions,
    selectedSkills,
    selectedBranchen,
    selectedCompanies,
  ]);

  return (
    <div>
      <h3 className="mb-4 text-xl">Filter</h3>

      {isTalent && (
        <div className="mb-6">
          <Label className="block text-sm font-semibold mb-2">Firmen:</Label>
          <div className="space-y-2">
            {availableCompanies.map((company) => (
              <div key={company} className="flex items-center space-x-2">
                <Checkbox
                  id={`company-${company}`}
                  disabled={disabled}
                  checked={selectedCompanies.includes(company)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCompanies((prev) => [...prev, company]);
                    } else {
                      setSelectedCompanies((prev) =>
                        prev.filter((c) => c !== company)
                      );
                    }
                  }}
                />
                <Label htmlFor={`company-${company}`} className="text-sm">
                  {company}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positionen */}
      <div className="mb-6">
        <Label className="block text-sm font-semibold mb-2">Positionen:</Label>
        <div className="space-y-2">
          {availablePositions.map((pos) => (
            <div key={pos} className="flex items-center space-x-2">
              <Checkbox
                id={`position-${pos}`}
                disabled={disabled}
                checked={selectedPositions.includes(pos)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPositions((prev) => [...prev, pos]);
                  } else {
                    setSelectedPositions((prev) =>
                      prev.filter((p) => p !== pos)
                    );
                  }
                }}
              />
              <Label htmlFor={`position-${pos}`} className="text-sm">
                {pos}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <Label className="block text-sm font-semibold mb-2">Skills:</Label>
        <div className="space-y-2">
          {availableSkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                disabled={disabled}
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

      {/* Branchen */}
      <div className="mb-6">
        <Label className="block text-sm font-semibold mb-2">Branchen:</Label>
        <div className="space-y-2">
          {availableBranchen.map((branche) => (
            <div key={branche} className="flex items-center space-x-2">
              <Checkbox
                id={`branche-${branche}`}
                disabled={disabled}
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
