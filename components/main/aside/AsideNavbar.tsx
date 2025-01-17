"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Tags,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import profilePic from "../../icons/menduicon.png";
import Image from "next/image";
import { useMatchesCount } from "@/hooks/useMatchesCount"; // <--- Our new hook

interface AsideNavProps {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
}

export default function AsideNav({ activeTab, setActiveTab }: AsideNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  // 1) State für Ein-/Ausklappen
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 2) Matches Count via custom hook
  const { count: matchesCount, loadingMatches } = useMatchesCount();

  // Beim Rendern den aktiven Tab basierend auf der Route setzen
  useEffect(() => {
    if (pathname.startsWith("/dashboard")) {
      setActiveTab("dashboard");
    } else if (pathname.startsWith("/matches")) {
      setActiveTab("matches");
    }
    // Weitere Routen können hier hinzugefügt werden
  }, [pathname, setActiveTab]);

  // Handler für Navigation
  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const handleMatchesClick = () => {
    router.push("/matches");
  };

  // Collapse-Button Handler
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Dynamische Breite basierend auf dem Collapse-Status
  const asideWidth = isCollapsed ? "w-20" : "w-64";

  return (
    <aside
      className={`
        fixed lg:static h-screen bg-base-100 border-r border-gray-200 p-4
        transition-all duration-200 ease-in-out z-40
        ${asideWidth}
        flex-shrink-0
      `}
    >
      {/* Kopfzeile / Logo + Collapse-Button */}
      <div className="flex items-center justify-between mb-4">
        {/* Logo + Text (wenn nicht eingeklappt) */}
        <div className="flex items-center">
          <Image
            src={profilePic}
            alt="Company Logo"
            width={isCollapsed ? 36 : 48}
            height={isCollapsed ? 36 : 48}
            className="rounded-full mr-2"
          />
          {!isCollapsed && <h1 className="font-semibold text-lg">Mendu</h1>}
        </div>

        {/* Collapse-Button */}
        <button
          onClick={toggleCollapse}
          className="btn btn-ghost btn-sm p-1"
          aria-label={isCollapsed ? "Menü erweitern" : "Menü einklappen"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4 pt-2">
        {/* Dashboard */}
        <button
          onClick={handleDashboardClick}
          className={`btn btn-ghost justify-start rounded-lg flex items-center p-2 ${
            activeTab === "dashboard" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Home className="w-5 h-5 mr-3" />
          {!isCollapsed && "Dashboard"}
        </button>

        {/* Matches */}
        <button
          onClick={handleMatchesClick}
          className={`btn btn-ghost justify-start rounded-lg flex items-center p-2 ${
            activeTab === "matches" ? "bg-primary/10 text-primary" : ""
          }`}
        >
          <Users className="w-5 h-5 mr-3" />
          {!isCollapsed && "Matches"}

          {/* Badge nur anzeigen, wenn nicht collapsed & wenn wir nicht noch laden */}
          {!isCollapsed && !loadingMatches && matchesCount > 0 && (
            <span className="badge badge-sm bg-primary text-white ml-auto p-3">
              {matchesCount} offen
            </span>
          )}
        </button>

        {/* Marktplatz (disabled) */}
        <button
          disabled
          className={`btn btn-ghost justify-start rounded-lg flex items-center p-2 
            cursor-not-allowed text-gray-400 bg-gray-100
          `}
        >
          <Tags className="w-5 h-5 mr-3" />
          {!isCollapsed && "Marktplatz"}
        </button>
      </nav>

      {/* Statistiken (nur anzeigen, wenn nicht collapsed) */}
      {!isCollapsed && (
        <div className="mt-8">
          <h2 className="px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Deine Statistiken
          </h2>
          <div className="rounded-lg p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="text-sm">0 Points</span>
              </div>
              <span className="text-xs text-gray-500">Rank #0</span>
            </div>

            {/* Balken */}
            <div className="h-24 flex items-end space-x-1 mb-4">
              {[40, 60, 30, 70, 50, 80, 45].map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className="flex-1 bg-primary/60 rounded-t transition-all hover:bg-primary/80"
                />
              ))}
            </div>

            {/* Donuts */}
            <div className="grid grid-cols-3 gap-2">
              {[75, 45, 90].map((progress, i) => {
                const dashArray = 125;
                const strokeVal = (dashArray * progress) / 100;
                return (
                  <div key={i} className="relative w-12 h-12">
                    <svg className="w-12 h-12">
                      <circle
                        className="text-gray-300"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                        r="20"
                        cx="24"
                        cy="24"
                      />
                      <circle
                        className="text-primary"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="20"
                        cx="24"
                        cy="24"
                        strokeDasharray={`${strokeVal} ${dashArray}`}
                      />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
