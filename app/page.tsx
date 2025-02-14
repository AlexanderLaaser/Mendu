"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth, onAuthStateChanged } from "@/firebase";
import LoadingIcon from "@/public/Loading";
import Landing from "@/components/main/landingpage/landing";
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

  return <Landing />;
}
