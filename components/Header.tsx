"use client";
import Image from "next/image";
import React from "react";
import Button from "./Button";
import { useRouter, usePathname } from "next/navigation"; // Importiere usePathname
import { useAuth } from "@/app/context/authContext";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function Header() {
  const router = useRouter(); // Router initialisieren
  const pathname = usePathname(); // Aktuellen Pfad erhalten
  const { user } = useAuth();

  const handleLoginButtonClick = () => {
    router.push("/login"); // Navigiert zur /login-Seite
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // Nach dem Logout zur Startseite weiterleiten
  };

  const handleMenduClick = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <header>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <button
            className="btn btn-ghost text-xl font-bold"
            onClick={handleMenduClick}
          >
            Mendu
          </button>
        </div>

        <div className="navbar-end">
          {user ? (
            // Benutzer ist angemeldet, zeige Benutzermenü
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar text-white"
              >
                <div className="w-10 rounded-full">
                  {/* <Image
                    alt="User avatar"
                    src={
                      user.photoURL ||
                      "https://placehold.co/80x80.png?text=User"
                    }
                  /> */}
                  AL
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a onClick={() => router.push("/profile")}>Profile</a>
                </li>
                <li>
                  <a onClick={() => router.push("/settings")}>Settings</a>
                </li>
                <li>
                  <a onClick={handleLogout}>Logout</a>
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
