"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { User as AppUser } from "@/models/user"; // Euer User-Interface

interface UserDataContextType {
  userData: Partial<AppUser> | null;
  loadingData: boolean;
  setUserData: React.Dispatch<React.SetStateAction<Partial<AppUser> | null>>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const useUserDataContext = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error(
      "useUserDataContext must be used inside a UserDataProvider."
    );
  }
  return context;
};

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<Partial<AppUser> | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Sobald Auth geladen und user vorhanden => Firestore abfragen
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        // Kein user => userData null
        setUserData(null);
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as Partial<AppUser>);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Benutzerdaten:", error);
        setUserData(null);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <UserDataContext.Provider value={{ userData, loadingData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}
