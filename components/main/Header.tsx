"use client";
import React from "react";
import Button from "../elements/buttons/Button";
import { useRouter, usePathname } from "next/navigation"; // Importiere usePathname
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { FiLogOut } from "react-icons/fi"; // Icon für Logout
import profilePic from "../../public/menduicon.png";
import Image from "next/image";
import { useUserDataContext } from "@/context/UserDataProvider";

export default function Header() {
  const router = useRouter(); // Router initialisieren
  const { user } = useAuth();
  const { userData } = useUserDataContext();
  const pathname = usePathname(); // Aktuellen Pfad erhalten

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
  const getUserInitials = (firstname?: string, lastName?: string): string => {
    const firstInitial =
      firstname && firstname.length > 0
        ? firstname.charAt(0).toUpperCase()
        : "";
    const lastInitial =
      lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <header>
      <div className="navbar bg-base-100 text-primary">
        <div className="navbar-start">
          <div className="flex items-center">
            <h1 className="font-semibold text-lg">
              <button
                className="btn btn-ghost font-semibold text-lg text-black"
                onClick={handleMenduClick}
              >
                <Image
                  src={profilePic}
                  alt="Company Logo"
                  width={48}
                  height={48}
                  className="rounded-full mr-2"
                />
                Mendu
              </button>
            </h1>
          </div>
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
                <div className="rounded-full flex items-center justify-center p-3">
                  {getUserInitials(
                    userData?.personalData?.firstName,
                    userData?.personalData?.lastName
                  ) || "?"}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 shadow"
              >
                {/* Benutzerinformationen */}
                <li className="menu-title">
                  <span className="font-bold text-black">
                    {userData?.personalData?.firstName || "Unknown User"}{" "}
                    {userData?.personalData?.lastName || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {userData?.personalData?.email || "No Email"}
                  </span>
                </li>
                <div className="divider my-1"></div>

                {/* Navigation */}
                {/* <li>
                  <a onClick={() => router.push("/profile")}>Profile</a>
                </li>
                <li>
                  <a onClick={() => router.push("/setup")}>Information</a>
                </li> */}

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
