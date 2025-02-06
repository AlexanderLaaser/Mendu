import React, { useState, useEffect } from "react";
import CategoryTag from "../tags/CategoryTag";

interface AutocompleteTagInputProps {
  placeholder?: string;
  onTagsChange?: (tags: string[]) => void;
  dataList: string[];
  initialTags?: string[];
  mode?: "active" | "passive";
  /**
   * Wenn true, darf nur ein Tag ausgewählt werden.
   * Fügt der Nutzer ein weiteres Tag hinzu, wird
   * das alte überschrieben.
   */
  singleSelection?: boolean;
}

const AutocompleteTagInput: React.FC<AutocompleteTagInputProps> = ({
  placeholder = "Angabe deiner Informationen",
  onTagsChange,
  dataList,
  initialTags = [],
  mode = "active",
  singleSelection = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Aktualisiert die Tags, wenn initialTags sich ändern
  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue) {
      const suggestions = dataList.filter(
        (item) =>
          item.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(item)
      );
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, tags, dataList]);

  // Handle adding a tag
  const addTag = (tag: string) => {
    let newTags: string[];

    if (singleSelection) {
      // Überschreibt alle bisherigen Tags mit dem neuen Tag
      newTags = [tag];
    } else {
      // Fügt den neuen Tag zu den bisherigen hinzu
      newTags = [...tags, tag];
    }

    setTags(newTags);
    setInputValue("");
    setShowSuggestions(false);

    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Handle removing a tag
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  // Handle selecting a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  // Handle pressing Enter or Tab keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (inputValue && !tags.includes(inputValue)) {
        addTag(inputValue);
      }
    }
    if (e.key === "Backspace" && !inputValue && tags.length) {
      // Entferne den letzten Tag
      removeTag(tags[tags.length - 1]);
    }
  };

  // Bestimmt, ob die Tags löschbar sind
  const tagsAreEditable = mode === "active";

  return (
    <div className="w-full">
      {/* Display Tags */}
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

      {/* Input Field nur im "active"-Modus sichtbar */}
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
            // Falls Sie verhindern möchten, dass ein weiterer Tag
            // eingegeben wird, wenn bereits einer existiert:
            disabled={singleSelection && tags.length === 1}
          />

          {/* Suggestions Dropdown */}
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
