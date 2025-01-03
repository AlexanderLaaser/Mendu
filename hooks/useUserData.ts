// hooks/useUserData.ts
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "@/models/user";
import { useAuth } from "@/context/AuthContext";

interface UseUserDataReturn {
  userData: Partial<User> | null;
  loadingData: boolean;
  setUserData: React.Dispatch<React.SetStateAction<Partial<User> | null>>; // <--- Hier
}

const useUserData = (): UseUserDataReturn => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Partial<User> | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoadingData(true);
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<User>;
            setUserData(data);
          } else {
            console.log("Dokument existiert nicht!");
            setUserData(null);
          }
        } catch (error) {
          console.error("Fehler beim Abrufen der Benutzerdaten:", error);
          setUserData(null);
        } finally {
          setLoadingData(false);
        }
      } else {
        setUserData(null);
        setLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  return { userData, loadingData, setUserData }; //
};

export default useUserData;
