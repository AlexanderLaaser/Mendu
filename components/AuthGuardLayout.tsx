"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingIcon from "@/components/icons/Loading";
import Header from "@/components/main/Header";
import AsideNav from "@/components/main/aside/AsideNavbar";
import DashboardHeader from "@/components/main/dashboard/DashboardHeader";
import { useUserDataContext } from "@/context/UserDataProvider";

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

  // 1) Solange Auth oder UserData noch lädt => Loading
  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIcon />
      </div>
    );
  }

  // 2) Falls kein User eingeloggt => /login (außer /, /login, /register)
  if (!user) {
    const ALLOWED_PUBLIC_PATHS = ["/", "/login", "/register"];
    if (!ALLOWED_PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
      return null;
    }

    // HIER: Header + children zurückgeben
    return (
      <>
        <Header />
        {children}
      </>
    );
  }

  // 3) Eingeloggt, aber setupComplete === false => /setup
  if (!userData?.setupComplete) {
    if (pathname !== "/setup") {
      router.replace("/setup");
      return null;
    }

    // Nur Setup-Seite + Header
    return (
      <>
        <Header />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  // 4) Eingeloggt & setupComplete => Dashboard
  // Falls wir uns noch auf /login oder /setup befinden, -> /dashboard
  if (pathname === "/login" || pathname === "/setup") {
    router.replace("/dashboard");
    return null;
  }

  // => Dashboard-Layout
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
