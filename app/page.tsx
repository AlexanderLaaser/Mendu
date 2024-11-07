"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Beachte das Update hier
import Dashboard from "@/components/Dashboard";
import Hero from "@/components/Hero";
import Main from "@/components/Main";
import { auth, db, doc, getDoc, onAuthStateChanged } from "@/firebase";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSettings = async (user: any) => {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists() || !userDoc.data().settingsCompleted) {
        router.push("/settings");
      } else {
        setLoading(false);
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        checkSettings(user);
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) return <p>Lädt...</p>;

  return <Main>{currentUser ? <Dashboard /> : <Hero />}</Main>;
}
