"use client";
import Image from "next/image";
import React from "react";
import Button from "../buttons/Button";
import { useRouter, usePathname } from "next/navigation"; // Importiere usePathname
import { useAuth } from "@/context/authContext";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { FiLogOut } from "react-icons/fi"; // Icon für Logout

export default function Header() {
  const router = useRouter(); // Router initialisieren
  const pathname = usePathname(); // Aktuellen Pfad erhalten
  const { user } = useAuth();

  const handleLoginButtonClick = () => {
    router.push("/login"); // Navigiert zur /login-Seite
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleMenduClick = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  // Extrahiere die Initialen des Benutzers aus dem Namen
  const getUserInitials = (displayName: string) => {
    const nameParts = displayName.split(" ");
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <header>
      <div className="navbar bg-base-100 text-primary">
        <div className="navbar-start">
          <button
            className="btn btn-ghost text-xl font-bold"
            onClick={handleMenduClick}
          >
            Mendu
          </button>
        </div>

        <div className="navbar-end text-black">
          {user ? (
            // Benutzer ist angemeldet, zeige Benutzermenü
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar text-white bg-primary"
              >
                <div className="rounded-full flex items-center justify-center">
                  {getUserInitials(user.displayName || "Unknown User")}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 shadow"
              >
                {/* Benutzerinformationen */}
                <li className="menu-title">
                  <span className="font-bold text-black">
                    {user.displayName || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </li>
                <div className="divider my-1"></div>

                {/* Navigation */}
                <li>
                  <a onClick={() => router.push("/profile")}>Profile</a>
                </li>
                <li>
                  <a onClick={() => router.push("/information")}>Information</a>
                </li>

                {/* Logout */}
                <div className="divider my-1"></div>
                <li>
                  <a onClick={handleLogout} className="flex items-center">
                    <FiLogOut className="mr-2" /> Logout
                  </a>
                </li>
              </ul>
            </div>
          ) : (
            // Benutzer ist nicht angemeldet und nicht auf der /login-Seite, zeige Login-Button
            pathname !== "/login" && (
              <Button variant="primary" onClick={handleLoginButtonClick}>
                Login
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
