import React, { useState, useEffect, useRef } from "react";

interface AutocompleteTagInputProps {
  fetchSuggestions: (query: string) => Promise<string[]>;
  placeholder?: string;
  onTagsChange?: (tags: string[]) => void;
}

const AutocompleteTagInput: React.FC<AutocompleteTagInputProps> = ({
  fetchSuggestions,
  placeholder = "Enter a value",
  onTagsChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions as the user types
  useEffect(() => {
    let active = true;

    const getSuggestions = async () => {
      if (inputValue) {
        const suggestions = await fetchSuggestions(inputValue);
        if (active) {
          setFilteredSuggestions(
            suggestions.filter((suggestion) => !tags.includes(suggestion))
          );
        }
      } else {
        setFilteredSuggestions([]);
      }
    };

    getSuggestions();

    return () => {
      active = false;
    };
  }, [inputValue, fetchSuggestions, tags]);

  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle adding a tag
  const addTag = (tag: string) => {
    setTags([...tags, tag]);
    setInputValue("");
    setShowSuggestions(false);
    if (onTagsChange) {
      onTagsChange([...tags, tag]);
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
        // Optionally, restrict input to suggestions only
        // For standardization, you can check if inputValue is in filteredSuggestions
        if (filteredSuggestions.includes(inputValue)) {
          addTag(inputValue);
        }
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
            className="inline-flex items-center px-2 py-1 bg-blue-200 text-blue-800 rounded-full"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-blue-500 hover:text-blue-700"
              onClick={() => removeTag(tag)}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative">
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
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow-lg max-h-60 overflow-auto"
          >
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
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
