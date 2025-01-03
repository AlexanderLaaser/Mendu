"use client";

import React from "react";
import { FaTrash } from "react-icons/fa";

// Beispiel: Interface (kannst du an deine Bedürfnisse anpassen)
export interface JobOffer {
  company: string;
  description: string;
  referralLink: string;
}

interface JobOfferCardProps {
  offer: JobOffer;
  onClick: () => void; // Wird aufgerufen, wenn man auf die Karte klickt (z. B. zum Bearbeiten)
  onDelete: () => void; // Löscht die Karte
}

export default function JobOfferCard({
  offer,
  onClick,
  onDelete,
}: JobOfferCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer 
        border 
        p-3 
        rounded 
        shadow-sm 
        bg-white 
        hover:shadow-md 
        transition-shadow
        relative
      "
      style={{ minHeight: "150px" }}
    >
      {/* Trash-Button oben rechts (Stop-Propagation, damit Card-Click nicht mitausgelöst wird) */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Verhindert, dass der Card-Click getriggert wird
          onDelete();
        }}
        className="absolute top-2 right-2 text-red-500 hover:text-red-600"
      >
        <FaTrash />
      </button>

      <h3 className="font-bold text-lg">{offer.company}</h3>
      <p className="text-sm text-gray-600 mt-2">{offer.description}</p>
      {offer.referralLink && (
        <a
          href={offer.referralLink}
          className="text-blue-500 underline text-sm"
          target="_blank"
          rel="noreferrer"
        >
          Referral-Link
        </a>
      )}
    </div>
  );
}
