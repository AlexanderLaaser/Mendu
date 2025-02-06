"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { useUserDataContext } from "@/context/UserDataContext";
import { Match } from "@/models/match"; // or wherever your Match model is defined

// We return both the count and loading state if we want to show a spinner, etc.
export function useMatchesCount() {
  const { user } = useAuth();
  const { userData } = useUserDataContext();
  const [count, setCount] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    console.log("useMatchesCount.tsx")

    // If we have no user or role, we can skip
    if (!user || !userData?.role) {
      setCount(0);
      setLoadingMatches(false);
      return;
    }

    // Example: We only want to track matches with status=FOUND
    // Adjust queries and filters to your needs
    const matchesRef = collection(db, "matches");
    const q = query(matchesRef, where("status", "==", "FOUND"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let tempMatches: Match[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Match;
          tempMatches.push(data);
        });

        // Filter based on user role:
        // - If user is an Insider, count the ones with insiderAccepted == false
        // - If user is a Talent, count the ones with talentAccepted == false
        if (userData.role === "Insider") {
          tempMatches = tempMatches.filter(
            (match) => match.insiderUid === user.uid && match.insiderAccepted === false
          );
        } else if (userData.role === "Talent") {
          tempMatches = tempMatches.filter(
            (match) => match.talentUid === user.uid && match.talentAccepted === false
          );
        } else {
          // If no role or unknown role, we skip
          tempMatches = [];
        }

        setCount(tempMatches.length);
        setLoadingMatches(false);
      },
      (error) => {
        console.error("Error fetching matches:", error);
        setCount(0);
        setLoadingMatches(false);
      }
    );

    return () => unsubscribe();
  }, [user, userData?.role]);

  return { count, loadingMatches };
}
