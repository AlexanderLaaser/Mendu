// hooks/useUserDataById.ts
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { User } from "@/models/user";

export function useUserDataById(userId: string | null) {
  const [userData, setUserData] = useState<User | null>(null);
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      const db = getFirestore();
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data() as User);
      }
    };

    fetchUserData();
  }, [userId]);

  return { userData };
}
