import { JobOffer } from "@/models/referral";
import React from "react";
import { FaTrash } from "react-icons/fa";

interface JobOfferCardProps {
  offer: JobOffer;
  onClick: () => void;
  onDelete: () => void;
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
        relative 
        flex 
        flex-col 
        justify-between 
        p-5 
        bg-white
        rounded-lg 
        border
        shadow-md 
        transition-transform 
        transform 
        hover:scale-105 
        hover:shadow-xl 
        cursor-pointer 
        overflow-hidden
      "
      style={{ minHeight: "180px" }} // leicht erhöhte Mindesthöhe für bessere Anzeige
    >
      {/* Löschen-Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="
          absolute 
          top-3 
          right-3 
          text-red-500 
          hover:text-red-600 
          transition-colors 
          z-10
        "
        aria-label="Delete Job Offer"
      >
        <FaTrash size={18} />
      </button>

      <div className="space-y-2">
        <h3 className="font-bold text-lg text-gray-800">{offer.company}</h3>
        {/* Anzeige der Position, falls vorhanden */}
        {offer.position && (
          <p className="text-sm text-primary font-semibold">{offer.position}</p>
        )}
        <p className="text-sm text-gray-600 line-clamp-3">
          {offer.description}
        </p>
      </div>

      {/* Referral-Link am unteren Rand */}
      {offer.referralLink && (
        <a
          href={offer.referralLink}
          target="_blank"
          rel="noreferrer"
          className="
            mt-4 
            inline-block 
            text-sm 
            font-medium 
            text-primary
            hover:text-blue-800 
            underline
          "
        >
          Referral-Link ansehen
        </a>
      )}
    </div>
  );
}
