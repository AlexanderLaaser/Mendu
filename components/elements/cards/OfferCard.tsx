import React from "react";
import { FaTrash, FaUser, FaBriefcase } from "react-icons/fa";
import { Offer } from "@/models/offers";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUserDataContext } from "@/context/UserDataContext";

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
  onDelete: () => void;
  isDisplayedInSearch?: boolean;
  disabled?: boolean;
}

export default function OfferCard({
  offer,
  onClick,
  onDelete,
  isDisplayedInSearch = false,
  disabled = false, // <-- NEU: Default auf false
}: OfferCardProps) {
  const { userData } = useUserDataContext();
  const isTalent = offer.userRole === "Talent";

  // Finde die Kategorie für Skills und extrahiere die Einträge
  const skills = offer.skills;

  const alreadyRequested =
    offer.requestedBy?.includes(userData?.uid ?? "") ?? false;

  return (
    <Card
      // CODE-ÄNDERUNG: Beseitigt feste Width-Angaben, nutzt w-full für responsive Layout
      className={
        "relative transition-transform transform border border-grey shadow-lg w-full min-h-[200px]" +
        (disabled
          ? " bg-gray-100 cursor-not-allowed"
          : " cursor-pointer hover:scale-105")
      }
    >
      {/* Kein "isDisplayedInSearch"? => Papierkorb-Button anzeigen */}
      {!isDisplayedInSearch && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          variant="ghost"
          className="absolute top-3 right-3 text-red-500 hover:text-red-600 z-10 p-2 bg-white"
          aria-label="Delete Job Offer"
        >
          <FaTrash size={18} />
        </Button>
      )}

      <CardContent className="flex flex-col justify-between space-y-2 p-5">
        <div className="space-y-2">
          {isTalent ? (
            <div>
              <Label className="font-bold text-lg flex items-center mb-2">
                {offer.firstNameCreator || "Name nicht definiert"}
              </Label>
              <div className="flex flex-row">
                <FaUser className="mr-2 mt-1" />
                {offer.leadershipLevel && (
                  <p className="text-sm">{offer.leadershipLevel}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Label className="font-bold text-lg text-gray-800">
                {offer.company}
              </Label>
              <div className="flex flex-row mt-2">
                <FaUser className="mr-2 mt-1" />
                {offer.firstNameCreator && (
                  <p className="text-sm">{offer.firstNameCreator}</p>
                )}
              </div>
            </div>
          )}

          {/* Anzeige der Position */}
          {offer.position && (
            <p className="text-sm font-normal flex items-center">
              <FaBriefcase className="mr-2" />
              {offer.position}
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-3 italic">
            {offer.description}
          </p>

          {/* Skills als Tags */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Wenn isDisplayedInSearch true ist, zeige den "Referral anfragen" Button */}
      {isDisplayedInSearch && (
        <CardFooter className="flex justify-center p-5">
          <Button
            disabled={disabled || alreadyRequested}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {alreadyRequested ? "Bereits angefragt" : "Referral anfragen"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
