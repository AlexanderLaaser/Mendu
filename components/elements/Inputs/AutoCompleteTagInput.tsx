// components/AutocompleteTagInput.tsx
import React, { useState, useEffect } from "react";
import CategoryTag from "../tags/CategoryTag";
import { useSuggestions } from "@/hooks/useSuggestions";

interface AutocompleteTagInputProps {
  placeholder?: string;
  onTagsChange?: (tags: string[]) => void;
  initialTags?: string[];
  mode?: "active" | "passive";
  categoryName: string;
  singleSelection?: boolean;
}

const AutocompleteTagInput: React.FC<AutocompleteTagInputProps> = ({
  placeholder = "Angabe deiner Informationen",
  onTagsChange,
  categoryName,
  initialTags = [],
  mode = "active",
  singleSelection = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // [Inline Kommentar: Neuer State für Fehlermeldungen]
  const [errorMessage, setErrorMessage] = useState(""); // <-- Neu

  const { suggestions, addNewSuggestionToFirestore } =
    useSuggestions(categoryName);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  useEffect(() => {
    if (inputValue) {
      const suggestionsFirestore = suggestions.filter(
        (item) =>
          item.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(item)
      );
      setFilteredSuggestions(suggestionsFirestore);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, tags, suggestions]);

  // Fügt einen neuen Tag hinzu
  const addTag = (tag: string) => {
    // [Inline Kommentar: Fehler abfangen, wenn Tag leer ist]
    if (!tag.trim()) {
      setErrorMessage("Bitte gib einen gültigen Begriff ein.");
      return;
    }

    // [Inline Kommentar: Fehler abfangen, wenn Tag bereits existiert]
    if (tags.includes(tag)) {
      setErrorMessage("Dieser Tag wurde bereits hinzugefügt.");
      return;
    }

    // [Inline Kommentar: Prüfen, ob nur eine Auswahl bei singleSelection erlaubt ist]
    let newTags: string[];
    if (singleSelection) {
      newTags = [tag];
    } else {
      newTags = [...tags, tag];
    }

    // [Inline Kommentar: Fehler zurücksetzen, wenn alles okay ist]
    setErrorMessage("");
    setTags(newTags);
    setInputValue("");
    setShowSuggestions(false);

    // [Inline Kommentar: Wenn Vorschlag neu ist => in Firestore speichern]
    if (!suggestions.includes(tag)) {
      addNewSuggestionToFirestore(tag);
    }

    // [Inline Kommentar: Callback ausführen]
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Entfernt ein Tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Verarbeitet Eingabeänderungen
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    // [Inline Kommentar: Fehlermeldung zurücksetzen, sobald Benutzer tippt]
    setErrorMessage("");
  };

  // Verarbeitet Klicks auf einen Vorschlag
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  // Verarbeitet Tastatureingaben (Enter, Tab, Backspace)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (inputValue && !tags.includes(inputValue)) {
        addTag(inputValue);
      }
    }
    if (e.key === "Backspace" && !inputValue && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const tagsAreEditable = mode === "active";

  return (
    <div className="w-full">
      {/* Anzeige der vorhandenen Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <CategoryTag
            key={tag}
            editable={tagsAreEditable}
            onDelete={() => removeTag(tag)}
          >
            {tag}
          </CategoryTag>
        ))}
      </div>

      {/* [Inline Kommentar: Fehlermeldung (wenn vorhanden) anzeigen] */}
      {errorMessage && (
        <div className="text-red-600 text-sm mb-2">{errorMessage}</div>
      )}

      {/* Inputfeld nur im "active"-Modus */}
      {mode === "active" && (
        <div>
          <input
            type="text"
            className="input input-bordered w-full text-sm"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            disabled={singleSelection && tags.length === 1} // Deaktivierung bei Einzelwahl
          />

          {/* Dropdown mit Vorschlägen */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="w-full bg-white border border-gray-300 mt-1 rounded shadow-lg max-h-60 overflow-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  style={{
                    borderBottom:
                      index < filteredSuggestions.length - 1
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteTagInput;
