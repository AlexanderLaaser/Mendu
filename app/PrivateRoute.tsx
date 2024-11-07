// PrivateRoute.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db, doc, getDoc, onAuthStateChanged } from "@/firebase";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
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
        checkSettings(user);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  if (loading) return <p>Lädt...</p>;
  return <>{children}</>;
}
