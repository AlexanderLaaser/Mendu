"use client";
// CODE-ÄNDERUNG: Bisher hatten wir nur das Lesen der Offers. Jetzt fügen wir Speichern und Löschen hinzu.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

// Unser Offer-Interface
export interface Offer {
  id: string;
  uid: string;
  userRole: "Talent" | "Insider";
  firstNameCreator: string;
  company?: string;
  position: string;
  description: string;
  link: string;
  skills: string[];
  leadershipLevel: string;
}

// Typ für das Context-Objekt
interface OfferContextType {
  // Alle Offers für den aktuellen User
  userOffers: Offer[];
  // Lade-Status
  loading: boolean;
  // Neues oder existierendes Offer speichern
  saveOffer: (
    offer: Omit<Offer, "id" | "uid">,
    userId: string,
    editingOffer?: Offer
  ) => Promise<void>;
  // Ein Offer löschen
  removeOffer: (offerId: string) => Promise<void>;
}

// Context anlegen
const OfferContext = createContext<OfferContextType | undefined>(undefined);

// Custom-Hook zum Verwenden des OfferContext
export const useOfferContext = (): OfferContextType => {
  const context = useContext(OfferContext);
  if (!context) {
    throw new Error("useOfferContext must be used within an OfferProvider");
  }
  return context;
};

// Provider-Komponente, die alle Offers des aktuellen Users in Echtzeit bezieht
// und Funktionen zum Speichern & Löschen bereitstellt
export const OfferProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const currentUserId = user?.uid;

  // State für Offers und Lade-Status
  const [userOffers, setUserOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Wenn kein User eingeloggt -> leere Offers, loading false
    if (!currentUserId) {
      setUserOffers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Firestore-Kollektion "offers" referenzieren
    const offersRef = collection(db, "offers");
    // Query: Lade nur Offers, die dem aktuellen User gehören
    const userOffersQuery = query(offersRef, where("uid", "==", currentUserId));

    // onSnapshot-Listener, um Echtzeit-Updates zu erhalten
    const unsubscribe = onSnapshot(userOffersQuery, (snapshot) => {
      const loadedOffers: Offer[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          userRole: data.userRole,
          firstNameCreator: data.firstNameCreator,
          company: data.company,
          position: data.position,
          description: data.description,
          link: data.link,
          skills: data.skills,
          leadershipLevel: data.leadershipLevel,
          requestedBy: data.requestedBy,
        } as Offer;
      });

      setUserOffers(loadedOffers);
      setLoading(false);
    });

    // Cleanup beim Unmount oder Nutzerwechsel
    return () => unsubscribe();
  }, [currentUserId]);

  const saveOffer = async (
    offer: Omit<Offer, "id" | "uid">,
    userId: string,
    editingOffer?: Offer
  ) => {
    try {
      // Entweder neues Document-Ref oder vorhandenes Doc referenzieren
      const docRef = editingOffer
        ? doc(db, "offers", editingOffer.id)
        : doc(collection(db, "offers"));
      // Daten ins Firestore-Dokument schreiben
      await setDoc(docRef, {
        ...offer,
        uid: userId, // Die uid des aktuellen Users
      });
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      throw error;
    }
  };

  // Offer löschen
  const removeOffer = async (offerId: string) => {
    try {
      const docRef = doc(db, "offers", offerId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      throw error;
    }
  };

  return (
    <OfferContext.Provider
      value={{ userOffers, loading, saveOffer, removeOffer }}
    >
      {children}
    </OfferContext.Provider>
  );
};
