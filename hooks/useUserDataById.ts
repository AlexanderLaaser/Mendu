// hooks/useUserDataById.ts
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { User } from "@/models/user";

export function useUserDataById(userId: string) {
  // Inline Kommentar: Default-User-Objekt gemäß deinem Modell; passe die Werte ggf. an.
  const defaultUser: User = {
    uid: userId,
    role: undefined,
    setupComplete: false,
    personalData: {
      firstName: "Unbekannt", // Inline Kommentar: Default Vorname
      lastName: "",           // Inline Kommentar: Default Nachname
      email: "",              // Inline Kommentar: Default E-Mail
      gender: "",             // Inline Kommentar: Default Geschlecht
    },
    matchSettings: {
      categories: [],         // Inline Kommentar: Default als leeres Array
      searchImmediately: false,
      furtherCompaniesRecommended: false,
      leadershipLevel: "",
    },
  };

  // Inline Kommentar: Initialisiere den State mit dem Default-User
  const [userData, setUserData] = useState<User>(defaultUser);

  // Inline Kommentar: Die asynchrone Logik wird in useEffect ausgeführt, um State-Updates nach dem Mount zuzulassen.
  useEffect(() => {
    if (!userId) return; // Inline Kommentar: Falls keine userId vorhanden ist, bleibt defaultUser erhalten

    const fetchUserData = async () => {
      const db = getFirestore();
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Inline Kommentar: Dokument gefunden – setze die tatsächlichen User-Daten
        setUserData(userDoc.data() as User);
      } else {
        // Inline Kommentar: Dokument nicht gefunden – defaultUser beibehalten
        setUserData(defaultUser);
      }
      // Inline Kommentar: Logging erfolgt hier nach dem State-Update
      console.log("User-Daten geladen:", userDoc.exists() ? userDoc.data() : defaultUser);
    };

    fetchUserData();
  }, [userId]); // Inline Kommentar: Effekt reagiert auf Änderungen der userId

  return { userData };
}
