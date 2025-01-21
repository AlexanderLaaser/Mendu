"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserDataContext } from "@/context/UserDataProvider";
import LoadingIcon from "@/public/Loading";
import Header from "@/components/main/Header";
import AsideNav from "@/components/main/aside/AsideNavbar";
import DashboardHeader from "@/components/main/dashboard/DashboardHeader";

// ALLOWED_PATHS könnte man optional auslagern
const ALLOWED_PUBLIC_PATHS = ["/", "/login", "/register"];

export default function AuthGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { userData, loadingData } = useUserDataContext();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("dashboard");

  // 1) Ladezustand
  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIcon />
      </div>
    );
  }

  // 2) Kein User eingeloggt?
  if (!user) {
    // Falls nicht eingeloggt und die Route ist nicht öffentlich => redirect /login
    if (!ALLOWED_PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
      return null;
    }

    // Sonst: Öffentliche Seite + Header
    return (
      <>
        <Header />
        {children}
      </>
    );
  }

  // 3) User ist eingeloggt. Setup vollständig?
  // Todo, an der Logik nochmal arbeiten. Beim ersten Anmelden laedt die Seite nicht richtig.
  if (userData === null || userData.setupComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIcon />
      </div>
    );
  }
  const setupDone = userData?.setupComplete === true;
  console.log("Setup done?", setupDone);

  if (!setupDone) {
    // Setup noch nicht gemacht => Nur /setup erlaubt
    if (pathname !== "/setup") {
      router.replace("/setup");
      return null;
    }

    // Wir sind auf /setup => Zeige Setup-Seite + Header
    return (
      <>
        <Header />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  // 4) User ist eingeloggt und Setup ist fertig.
  // Falls wir auf /login oder /setup sind => auf /dashboard umleiten
  // Anpassung: Keine Umleitung, wenn der aktuelle Pfad "/marketplace" ist
  if (pathname === "/login" || pathname === "/setup") {
    router.replace("/dashboard");
    return null;
  }

  // 5) Hier: Dashboard-Layout
  return (
    <div className="flex min-h-screen">
      <AsideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 bg-slate-100">
        <DashboardHeader />
        {children}
      </main>
    </div>
  );
}
