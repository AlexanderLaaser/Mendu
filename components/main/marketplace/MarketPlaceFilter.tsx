"use client";

import React, { useState, useEffect } from "react";
import { JobOfferEntry } from "@/models/referral";

interface MarketPlaceFilterProps {
  jobOffer?: JobOfferEntry; // Optionales JobOffer, um Standardposition zu entnehmen
  onFilterChange?: (filters: { skills: string[]; position: string }) => void;
}

export default function MarketPlaceFilter({
  jobOffer,
  onFilterChange,
}: MarketPlaceFilterProps) {
  // Initialisiere den Standardwert der Position anhand des JobOffer
  const [selectedPosition, setSelectedPosition] = useState<string>(
    jobOffer?.position || ""
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    // Informiere bei Änderungen der Filter über die Callback-Funktion
    onFilterChange &&
      onFilterChange({ skills: selectedSkills, position: selectedPosition });
  }, [selectedSkills, selectedPosition, onFilterChange]);

  return (
    <div className="w-1/5 p-4 border-r border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Filter</h3>

      {/* Filter für Skills */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Skills:</label>
        {/* Hier können Checkboxen oder ein anderes Auswahlfeld für Skills eingefügt werden */}
        {/* Beispielhafte Implementierung: */}
        <div className="space-y-2">
          {["JavaScript", "TypeScript", "React", "Node.js"].map((skill) => (
            <div key={skill} className="flex items-center">
              <input
                type="checkbox"
                id={`skill-${skill}`}
                value={skill}
                checked={selectedSkills.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSkills((prev) => [...prev, skill]);
                  } else {
                    setSelectedSkills((prev) =>
                      prev.filter((s) => s !== skill)
                    );
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={`skill-${skill}`} className="text-sm">
                {skill}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Filter für Position */}
      <div>
        <label className="block text-sm font-medium mb-2">Position:</label>
        <input
          type="text"
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  );
}
