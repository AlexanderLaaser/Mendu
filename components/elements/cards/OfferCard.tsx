import React from "react";
import { FaTrash, FaUser, FaBriefcase } from "react-icons/fa";
import { Offer } from "@/models/offers";

// Importiere Shadcn-UI-Komponenten
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Annahme: Es gibt einen Context, der User-Daten liefert
import { useUserDataContext } from "@/context/UserDataContext";

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
  onDelete: () => void;
  isDisplayedInSearch?: boolean;
  // --NEU: Option, um den Button und ggf. die Karte zu deaktivieren--
  /* Inline-Kommentar: Dieser neue Prop kann gesetzt werden, falls wir die Karte manuell deaktivieren wollen 
     (z.B. wenn bereits eine Anfrage vom aktuellen User vorliegt). */
  disabled?: boolean; // <-- NEU
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

  async function handleRequestReferral(offer: Offer) {
    try {
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

  // --NEU: Prüfen, ob aktueller User bereits angefragt hat (falls 'requestedBy' vom Backend kommt)
  /* Inline-Kommentar: Hier lesen wir aus dem Offer, ob 'requestedBy' schon die UserID enthält.
     Diese Logik kann alternativ im Parent (MarketplaceSearch) passieren. */
  const alreadyRequested =
    offer.requestedBy?.includes(userData?.uid ?? "") ?? false; // <-- NEU

  return (
    <Card
      onClick={!disabled ? onClick : undefined}
      className={
        // --NEU: CSS-Klassen anpassen, wenn disabled--
        "relative transition-transform transform border border-grey shadow-lg max-w-[300px] min-w-[300px]" +
        (disabled
          ? " bg-gray-100 cursor-not-allowed"
          : " cursor-pointer hover:scale-105")
      }
      style={{ minHeight: "200px" }}
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
