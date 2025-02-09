// hooks/useFirestoreSuggestions.ts
import { useState, useEffect } from "react";
import { db } from "../firebase"; // **CHANGED**: Importiere die Firebase-Instanz
import { collection, getDocs, addDoc } from "firebase/firestore";

export function useSuggestions(categoryName: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const collectionName = "dataset_" + categoryName;

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const collRef = collection(db, collectionName );
        const snapshot = await getDocs(collRef);
        const allSuggestions: string[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.name) {
            allSuggestions.push(data.name);
          }
        });

        setSuggestions(allSuggestions);
      } catch (error) {
        console.error("Fehler beim Laden der Firestore-Daten:", error);
      }
    };

    fetchSuggestions();
  }, [categoryName, collectionName]);

  const addNewSuggestionToFirestore = async (newValue: string) => {
    try {
      if (!suggestions.includes(newValue)) {
        const collRef = collection(db, collectionName);
        await addDoc(collRef, { name: newValue });
        setSuggestions((prev) => [...prev, newValue]); 
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen eines neuen Firestore-Eintrags:", error);
    }
  };

  return { suggestions, addNewSuggestionToFirestore };
}