"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/main/Hero";
import { auth, onAuthStateChanged } from "@/firebase";
import LoadingIcon from "@/components/icons/Loading";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Wenn der Benutzer angemeldet ist, leite auf /dashboard weiter
        router.push("/dashboard");
      } else {
        // Benutzer ist nicht angemeldet, Ladezustand beenden
        setLoading(false);
      }
    });

    // Bereinige den Listener beim Unmounten der Komponente
    return () => unsubscribe();
  }, [router]);

  if (loading) return <LoadingIcon />;

  // Zeige die Hero-Komponente an, wenn der Benutzer nicht angemeldet ist
  return <Hero />;
}
