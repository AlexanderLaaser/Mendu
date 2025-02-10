// components/sections/CategorySetupSection.tsx

import React from "react";
import AutocompleteTagInput from "../Inputs/AutoCompleteTagInput";
import { getCategoryIcon } from "@/utils/categoryHandler";
interface CategorySetupSectionProps {
  /** Titel, der neben dem Icon angezeigt wird (z. B. "Firmen", "Branchen", etc.) */
  title: string;
  categoryName: string;

  /** Bereits vorhandene Tags (z. B. aus Firestore) */
  initialTags: string[];
  /**
   * Callback, wird aufgerufen, sobald sich die Tags ändern (z. B. wenn der User neue Tags hinzufügt)
   */
  onTagsChange?: (tags: string[]) => void;
  mode?: "active" | "passive";
  singleSelection?: boolean;
}

const CategorySetupSection: React.FC<CategorySetupSectionProps> = ({
  title,
  categoryName,
  initialTags,
  onTagsChange,
  mode = "active",
  singleSelection,
}) => {
  const icon = getCategoryIcon(categoryName);

  return (
    <div className="mt-4">
      <div className="flex flex-row">
        {icon}
        <label className="block text-sm font-semibold mb-2">{title}</label>
      </div>

      <div className="tag-container">
        <AutocompleteTagInput
          categoryName={categoryName}
          initialTags={initialTags}
          onTagsChange={onTagsChange}
          mode={mode}
          singleSelection={singleSelection}
        />
      </div>
    </div>
  );
};

export default CategorySetupSection;
