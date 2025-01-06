"use client";

import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/models/user";

interface SearchStatusProps {
  userId: string;
  searchImmediately: boolean;
  setUserData: React.Dispatch<React.SetStateAction<Partial<User> | null>>;
}

export default function SearchStatus({
  userId,
  searchImmediately,
  setUserData,
}: SearchStatusProps) {
  const [enabled, setEnabled] = useState(searchImmediately);
  const [updating, setUpdating] = useState(false);

  // Synchronisiere den lokalen State mit den Props
  useEffect(() => {
    setEnabled(searchImmediately);
  }, [searchImmediately]);

  const handleToggle = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    setUpdating(true);

    try {
      // 1) Firestore aktualisieren (merge: true => restlicher DB-Inhalt bleibt erhalten)
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          matchSettings: {
            searchImmediately: newValue,
          },
        },
        { merge: true }
      );

      // 2) Lokalen State im userData-Hook updaten
      setUserData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          matchSettings: {
            ...prev.matchSettings,
            searchImmediately: newValue,
            categories: prev.matchSettings?.categories || [],
          },
        };
      });
    } catch (error) {
      console.error("Fehler beim Aktualisieren von searchImmediately:", error);
      // Optional: Rücksetzen des Switches bei Fehler
      setEnabled(!newValue);
      // Optional: Fehleranzeige hinzufügen (z.B. Toast)
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      {/* DaisyUI Toggle mit dynamischer Farbe und kleinerer Größe */}
      <label className="cursor-pointer label pl-0">
        <span className="label-text sr-only ">Suche Status</span>
        <input
          type="checkbox"
          className={`toggle ${
            enabled ? "toggle-success" : "toggle-error"
          } scale-75`}
          checked={enabled}
          onChange={handleToggle}
          disabled={updating}
        />
      </label>

      {/* Label ohne Unterstreichung */}
      <span
        className={`text-sm font-semibold ${
          enabled ? "text-green-500" : "text-stone-400"
        }`}
      >
        {enabled ? "Suche aktiv" : "Suche ausgesetzt"}
      </span>
    </div>
  );
}
