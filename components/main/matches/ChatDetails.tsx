"use client";

import React, { useState } from "react";
import { Match } from "@/models/match";
// CODE-ÄNDERUNG: Importiere benötigte Icons, inklusive dem Drei-Punkte-Icon
import {
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
  FiMoreHorizontal,
} from "react-icons/fi";

// CODE-ÄNDERUNG: Eigene Props-Definition für Klarheit
interface ChatDetailsProps {
  match: Match;
  showDetails: boolean;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseMatch: () => void;
  onCancelMatch: () => void;
}

const ChatDetails: React.FC<ChatDetailsProps> = ({
  match,
  showDetails,
  setShowDetails,
  onCloseMatch,
  onCancelMatch,
}) => {
  // CODE-ÄNDERUNG: State, um das Menü (Drei-Punkte) ein- bzw. auszublenden
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-300 flex flex-col gap-4 rounded-md shadow-md relative">
      {/* HEADER: Links der Arrow-Toggle, rechts das Drei-Punkte-Icon */}
      <div className="flex items-center justify-between w-full">
        {/* CODE-ÄNDERUNG: Arrow-Toggle komplett links */}
        <button
          onClick={() => setShowDetails((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-semibold text-black hover:underline"
        >
          {showDetails ? (
            <FiChevronUp className="h-6 w-6" />
          ) : (
            <FiChevronDown className="h-6 w-6" />
          )}
          <span>
            {showDetails
              ? "Match-Details ausblenden"
              : "Match-Details anzeigen"}
          </span>
        </button>

        {/* CODE-ÄNDERUNG: Drei-Punkte-Icon rechts, das ein Menü öffnet */}
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FiMoreHorizontal className="h-6 w-6" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md z-10">
              <button
                onClick={() => {
                  onCloseMatch();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-green-100 flex items-center gap-2"
              >
                <FiCheck />
                <span>Match abschließen</span>
              </button>
              <button
                onClick={() => {
                  onCancelMatch();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 flex items-center gap-2"
              >
                <FiX />
                <span>Match abbrechen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details-Bereich, der bei showDetails angezeigt wird */}
      {showDetails && (
        <div className="p-4 rounded-md">
          <div className="text-sm text-gray-700 mb-4">
            <div className="mb-2">
              <span className="block font-semibold">Firma:</span>
              <span>{match.matchParameters.company || "keine Angaben"}</span>
            </div>
            <div className="mb-2">
              <span className="block font-semibold">Position:</span>
              <span>
                {match.matchParameters.positions &&
                match.matchParameters.positions.length
                  ? match.matchParameters.positions.join(", ")
                  : "Keine Positionen hinterlegt"}
              </span>
            </div>
            <div>
              <span className="block font-semibold">Skills:</span>
              <span>
                {match.matchParameters.skills &&
                match.matchParameters.skills.length
                  ? match.matchParameters.skills.join(", ")
                  : "Keine Skills hinterlegt"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetails;
