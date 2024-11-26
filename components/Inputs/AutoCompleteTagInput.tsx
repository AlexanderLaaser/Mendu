import React, { useState, useEffect, useRef } from "react";

interface AutocompleteTagInputProps {
  placeholder?: string;
  onTagsChange?: (tags: string[]) => void;
  dataList: string[];
  initialTags?: string[]; // Neue Prop für initiale Tags
}

const AutocompleteTagInput: React.FC<AutocompleteTagInputProps> = ({
  placeholder = "Enter a value",
  onTagsChange,
  dataList,
  initialTags = [], // Standardwert ist ein leeres Array
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);

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
    const newTags = [...tags, tag];
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
      // Remove the last tag
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="w-full">
      {/* Display Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 bg-blue-200 text-primary rounded-full"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-primary hover:text-blue-700"
              onClick={() => removeTag(tag)}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {/* Input Field */}
      <div className="">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
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
    </div>
  );
};

export default AutocompleteTagInput;
