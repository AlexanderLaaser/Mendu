// hooks/useUsersData.ts
import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { User } from "@/models/user";

export function useUsersData(userIds: string[]): Record<string, User | undefined> {
  const [usersData, setUsersData] = useState<Record<string, User | undefined>>({});

  useEffect(() => {
    if (userIds.length === 0) return;

    const fetchUsers = async () => {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      // Angenommen, die Sammlung heißt "users" und wir können mit 'in' Query mehrere IDs abrufen
      const q = query(usersRef, where("uid", "in", userIds));
      const querySnapshot = await getDocs(q);
      const data: Record<string, User> = {};
      querySnapshot.forEach((doc) => {
        const user = doc.data() as User;
        data[user.uid] = user;
      });
      setUsersData(data);
    };

    fetchUsers();
  }, [userIds]);

  return usersData;
}
