// services/OfferService.ts
import { Offer } from "@/models/offers";

// Anpassung: Funktion akzeptiert nun Filter (skills & positions)
export async function fetchOffers(filters: {
  skills: string[];
  positions: string[];
}): Promise<Offer[]> {
  const params = new URLSearchParams();

  if (filters.skills && filters.skills.length > 0) {
    params.append("skills", filters.skills.join(",")); // <-- Anpassung: Skills als Query-Parameter hinzufügen
  }
  if (filters.positions && filters.positions.length > 0) {
    params.append("positions", filters.positions.join(",")); // <-- Anpassung: Positions als Query-Parameter hinzufügen
  }

  const url = `/api/offers?${params.toString()}`; // <-- Anpassung: URL mit Query-Parametern
  console.log("Fetching offers from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch job offers");
  }
  return response.json();
}
