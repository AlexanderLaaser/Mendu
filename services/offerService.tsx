// services/OfferService.ts

import { Offer } from "@/models/offers";

export async function fetchOffers(): Promise<Offer[]> {
  const response = await fetch("/api/offers");
  if (!response.ok) {
    throw new Error("Failed to fetch job offers");
  }
  return response.json();
}

export async function createOffer(offer: Offer): Promise<Offer> {
  const response = await fetch("/api/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(offer),
  });
  if (!response.ok) {
    throw new Error("Failed to create job offer");
  }
  return response.json();
}

export async function updateOffer(id: string, offer: Offer): Promise<Offer> {
  const response = await fetch(`/api/offers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(offer),
  });
  if (!response.ok) {
    throw new Error("Failed to update job offer");
  }
  return response.json();
}

export async function deleteOffer(id: string): Promise<void> {
  const response = await fetch(`/api/offers/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete job offer");
  }
}
