import { BsBuilding } from "react-icons/bs";
import { FaIndustry, FaUserTie } from "react-icons/fa";

export const getCategoryTitle = (categoryName: string) => {
  switch (categoryName) {
    case "companies":
      return "Firmen";
    case "industries":
      return "Branchen";
    case "positions":
      return "Positionen";
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
    default:
      return null;
  }
};

export const categoryTitles: Record<string, Record<string, string>> = {
  Talent: {
    companies: "Interessante Firmen",
    industries: "Relevante Branchen",
    positions: "Interessante Positionen",
  },
  Insider: {
    companies: "Aktuelle Arbeitgeber",
    industries: "Derzeitige Branchenerfarung",
    positions: "Besetzte Positionen",
  },
};
