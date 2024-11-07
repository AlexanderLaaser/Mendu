import React, { useState, useEffect, KeyboardEvent } from "react";

interface TagInputProps {
  label: string;
  placeholderExamples?: string[]; // Array von Platzhalterbeispielen
}

const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholderExamples = [],
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(",", "");
      if (!tags.includes(newTag)) {
        setTags((prevTags) => [...prevTags, newTag]);
      }
      setTagInput(""); // Eingabefeld leeren
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  // Zyklisches Ändern des Platzhalters
  useEffect(() => {
    if (placeholderExamples.length > 0) {
      const interval = setInterval(() => {
        setPlaceholderIndex(
          (prevIndex) => (prevIndex + 1) % placeholderExamples.length
        );
      }, 2000); // Wechselt alle 2 Sekunden

      return () => clearInterval(interval); // Bereinigen beim Unmount
    }
  }, [placeholderExamples]);

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      {/* Eingabefeld */}
      <input
        type="text"
        placeholder={
          placeholderExamples.length > 0
            ? placeholderExamples[placeholderIndex]
            : "Tag eingeben und Enter drücken"
        }
        className="input input-bordered w-full mt-2"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleTagInputKeyDown}
      />
      {/* Container für die Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="badge badge-primary text-sm h-8 flex items-center text-black"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(index)}
              className="btn btn-xs btn-circle btn-ghost ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagInput;
