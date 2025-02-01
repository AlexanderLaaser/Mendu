"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useGetUnreadMessages } from "@/hooks/useGetUnreadMessages";
import { MessageSquare } from "lucide-react"; // Import des Chat-Icons
import { useUserDataContext } from "@/context/UserDataContext";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Mittag";
  return "Guten Abend";
};

// Extrahiere die Initialen des Benutzers aus dem Namen
const getUserInitials = (firstname?: string, lastName?: string): string => {
  const firstInitial =
    firstname && firstname.length > 0 ? firstname.charAt(0).toUpperCase() : "";
  const lastInitial =
    lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : "";
  return `${firstInitial}${lastInitial}`;
};

export default function DashboardHeader() {
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  const router = useRouter();
  const handleIconClick = () => {
    // Navigiere zur Chat-Seite. Die Ziel-URL kann je nach Anwendung variieren.
    router.push("/matches");
  };
  const { userData } = useUserDataContext();
  const unreadCount = useGetUnreadMessages(userData?.uid);

  return (
    <div>
      <header className="border-b border-gray-200 p-4 pl-16 lg:pl-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <h2 className="font-medium">
                {getGreeting()}, {userData?.personalData?.firstName}
              </h2>
              <p className="text-sm text-primary">{userData?.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer" onClick={handleIconClick}>
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
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
                <li className="">
                  <span className="font-semibold text-black ">
                    {userData?.personalData?.firstName || "Unknown User"}{" "}
                    {userData?.personalData?.lastName || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {userData?.personalData?.email || "No Email"}
                  </span>
                </li>
                <div className="divider my-1"></div>

                {/* Navigation
                <li>
                  <a onClick={() => router.push("/profile")}>Profile</a>
                </li>
                <li>
                  <a onClick={() => router.push("/setup")}>Setup</a>
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
          </div>
        </div>
      </header>
    </div>
  );
}
