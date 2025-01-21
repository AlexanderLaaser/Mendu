import { BsBuilding } from "react-icons/bs";
import { FaIndustry, FaNetworkWired, FaUserTie } from "react-icons/fa";

export const getCategoryTitle = (categoryName: string) => {
  switch (categoryName) {
    case "companies":
      return "Firmen";
    case "industries":
      return "Branchen";
    case "positions":
      return "Positionen";
    case "skills":
      return "Skills";
    default:
      return categoryName;
  }
};

// Hilfsfunktion, um das passende Icon für jede Kategorie zurückzugeben
export const getCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
    case "companies":
      return <BsBuilding className="inline-block mr-2 text-base" />;
    case "industries":
      return <FaIndustry className="inline-block mr-2 text-base" />;
    case "positions":
      return <FaUserTie className="inline-block mr-2 text-base" />;
    case "skills":
      return <FaNetworkWired className="inline-block mr-2 text-base" />;
    default:
      return null;
  }
};

export const categoryTitles: Record<string, Record<string, string>> = {
  Talent: {
    companies: "Interessante Firmen",
    industries: "Relevante Branchen",
    positions: "Spannende Positionen",
    skills: "Vorhandene Skills",
  },
  Insider: {
    companies: "Aktuelle Arbeitgeber",
    industries: "Derzeitige Branchenerfarung",
    positions: "Besetzte Positionen",
    skills: "Benötigte Skills",
  },
};
