import { Offer } from "@/models/offers";

// Anpassung: Funktion akzeptiert nun Filter (skills & positions)
export async function offerService(filters: {
  skills: string[];
  positions: string[];
}): Promise<Offer[]> {
  const params = new URLSearchParams();

  if (filters.skills && filters.skills.length > 0) {
    params.append("skills", filters.skills.join(","));
  }
  if (filters.positions && filters.positions.length > 0) {
    params.append("positions", filters.positions.join(","));
  }

  const url = `/api/offers?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch job offers");
  }
  return response.json();
}
