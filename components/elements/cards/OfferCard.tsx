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

  async function handleRequestReferral(offer: Offer) {
    try {
      // Das Offer-Objekt enthält .company, .position
      if (!userData?.uid || !userData.role) {
        console.error("User nicht eingeloggt oder Rolle nicht bekannt.");
        return;
      }

      const payload = {
        currentUserId: userData.uid,
        offerCreatorId: offer.uid, // Der Ersteller des Offers
        role: userData.role, // "Talent" | "Insider"
        offerData: {
          company: offer.company,
          position: offer.position,
          // weitere Felder falls nötig
        },
      };

      const res = await fetch("/api/marketMatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        console.log("MatchID:", data.matchId, "ChatID:", data.chatId);
        // hier ggf. UI anpassen oder navigieren
      } else {
        console.error("Fehler:", data.message);
      }
    } catch (err) {
      console.error("Requestfehler:", err);
    }
  }

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
        <div className="space-y-2 ">
          {/* Wenn Talent, zeige leadershipLevel an, ansonsten Firmenname */}

          {isTalent ? (
            <div>
              <Label className="font-bold text-lg  flex items-center mb-2">
                {offer.firstNameCreator || "Name nicht definiert"}
              </Label>
              <div className="flex flex-row ">
                <FaUser className="mr-2 mt-1" />
                {offer.leadershipLevel && (
                  <p className="text-sm ">{offer.leadershipLevel}</p>
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
                  <p className="text-sm ">{offer.firstNameCreator}</p>
                )}
              </div>
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

      {/* Wenn isDisplayedInSearch true ist, zeige den "Referral anfragen" Button */}
      {isDisplayedInSearch && (
        <CardFooter className="flex justify-center p-5">
          <Button
            onClick={(e) => {
              e.stopPropagation();

              // CURRENT USER = derjenige, der "Referral anfragt".
              // Beispielfunktion, die den Chat anlegt.
              handleRequestReferral(offer);
            }}
          >
            Referral anfragen
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
