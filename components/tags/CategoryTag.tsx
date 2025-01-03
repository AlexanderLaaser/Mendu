// components/Tag.tsx

import React from "react";

interface TagProps {
  /** Der Inhalt des Tags */
  children: React.ReactNode;
  /** Optional: Zusätzliche CSS-Klassen für individuelle Anpassungen */
  className?: string;
  /** Optional: Funktion, die beim Klicken auf den Lösch-Button aufgerufen wird */
  onDelete?: () => void;
  /** Gibt an, ob das Tag bearbeitbar ist (d.h., ob der Lösch-Button angezeigt wird) */
  editable?: boolean;
}

const CategoryTag: React.FC<TagProps> = ({
  children,
  className = "",
  onDelete,
  editable,
}) => {
  return (
    <span
      className={`inline-block bg-primary/40 text-sm  rounded px-2 py-1 mr-2 mb-2 cursor-default ${className}`}
    >
      {children}
      {editable && (
        <button
          type="button"
          className="ml-1 text-black hover:text-blue-700 focus:outline-none"
          onClick={onDelete}
          aria-label="Tag entfernen"
        >
          &times;
        </button>
      )}
    </span>
  );
};

export default CategoryTag;
