import React from "react";
import { FaTrash, FaUser, FaBriefcase } from "react-icons/fa";
import { Offer } from "@/models/offers";
// Importiere Shadcn-UI-Komponenten
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Annahme: Es gibt einen Context, der User-Daten liefert
import { useUserDataContext } from "@/context/UserDataProvider";

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
  onDelete: () => void;
  isDisplayedInSearch?: boolean;
}

export default function OfferCard({
  offer,
  onClick,
  onDelete,
  isDisplayedInSearch = false,
}: OfferCardProps) {
  const { userData } = useUserDataContext();
  const isTalent = offer.userRole === "Talent";
  const isInsider = offer.userRole === "Insider";

  // Extrahiere leadershipLevel aus dem Kontext, falls vorhanden
  const leadershipLevel = userData?.matchSettings?.leadershipLevel;

  // Finde die Kategorie für Skills und extrahiere die Einträge
  const skills = offer.skills;

  return (
    <Card
      onClick={onClick}
      className="relative cursor-pointer transition-transform transform hover:scale-105"
      style={{ minHeight: "180px" }}
    >
      {/* Löschen-Button */}
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
          {/* Wenn Talent, zeige leadershipLevel an, ansonsten Firmenname */}
          {isTalent ? (
            <div>
              <Label className="font-bold text-lg  flex items-center">
                {offer.firstNameCreator || "Name nicht definiert"}
              </Label>
              {offer.leadershipLevel && (
                <p className="text-sm text-gray-600">
                  <FaUser className="mr-2" />
                  {offer.leadershipLevel}
                </p>
              )}
            </div>
          ) : (
            <div>
              <Label className="font-bold text-lg text-gray-800">
                {offer.company}
              </Label>
            </div>
          )}

          {/* Anzeige der Position, falls vorhanden */}
          {offer.position && (
            <p className="text-sm font-normal flex items-center">
              <FaBriefcase className="mr-2" />
              {offer.position}
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-3 italic">
            {offer.description}
          </p>

          {/* Skills als Tags anzeigen */}
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

      {/* Nur Insider sehen den Referral-/Social Link */}
      {isInsider && offer.link && (
        <CardFooter className="p-5">
          {/* Referral-Link kann hier hinzugefügt werden, falls benötigt */}
        </CardFooter>
      )}

      {/* Wenn isDisplayedInSearch true ist, zeige den "Referral anfragen" Button */}
      {isDisplayedInSearch && (
        <CardFooter className="flex justify-center p-5">
          <Button>Referral anfragen</Button>
        </CardFooter>
      )}
    </Card>
  );
}
