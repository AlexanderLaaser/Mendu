"use client";

import DashboardCard from "@/components/cards/DashboardCard";
import Chat from "@/components/chat/chat";
import ChatList from "@/components/chat/chatList";
import { db } from "@/firebase";
import {
  query,
  collection,
  where,
  orderBy,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Chat as ChatType } from "@/models/chat";
import { useAuth } from "@/context/AuthContext";
import useUserData from "@/hooks/useUserData";
import DashboardHeader from "../dashboard/DashboardHeader";
import LoadingIcon from "@/components/icons/Loading";
export default function Matches() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData, setUserData } = useUserData();

  // State für aktiven Chat
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatType[] | null>(null);

  // "aktive Suche"
  const [activeSearch, setActiveSearch] = useState<boolean>(false);
  const searchAbortRef = useRef<boolean>(false);

  // 1) Prüfen, ob alle Kategorien gefüllt sind
  const checkAllCategoriesFilled = () => {
    if (!userData?.matchSettings?.categories) return false;
    const requiredCategories = ["companies", "industries", "positions"];
    return requiredCategories.every((cat) =>
      userData.matchSettings?.categories.some(
        (category) =>
          category.categoryName === cat && category.categoryEntries.length > 0
      )
    );
  };
  const allCategoriesFilled = checkAllCategoriesFilled();

  // 2) useEffect -> Start Matching
  useEffect(() => {
    if (allCategoriesFilled) {
      setActiveSearch(true);
      searchAbortRef.current = false;
      getMatch();
    } else {
      setActiveSearch(false);
      searchAbortRef.current = true;
    }
  }, [allCategoriesFilled]);

  // 3) Minimales Matching
  async function getMatch() {
    if (!user) return;
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talentUid: user.uid }),
      });
      if (!res.ok) {
        console.error("Fehler: /api/match Status:", res.status);
        return;
      }
      const result = await res.json();
      if (searchAbortRef.current) {
        return;
      }
      if (result.success) {
        console.log("Match gefunden:", result.chatId);
        setActiveChatId(result.chatId);
      } else {
        console.log("Kein Insider gefunden:", result.message);
        setTimeout(() => {
          if (!searchAbortRef.current) {
            getMatch();
          }
        }, 10000);
      }
    } catch (error) {
      console.error("Fehler beim Matching:", error);
    }
  }

  // 4) Chats in der DB laden (nur 1x, wenn user vorhanden)
  useEffect(() => {
    if (!user) return;
    console.log("Start Chat-Listener for user:", user.uid);

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: ChatType[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DocumentData;
        loaded.push({
          chatId: docSnap.id,
          participants: data.participants || [],
          createdAt: data.createdAt?.toDate() ?? new Date(),
          lastMessage: data.lastMessage
            ? {
                text: data.lastMessage.text,
                senderId: data.lastMessage.senderId,
                createdAt: data.lastMessage.createdAt?.toDate() ?? new Date(),
              }
            : undefined,
          insiderCompany: data.insiderCompany,
        });
      });
      // State setzen
      console.log("Chats loaded:", loaded);
      setChats(loaded.length > 0 ? loaded : []);
      // Falls wir noch keinen activeChatId haben, aber mind. 1 Chat existiert
      if (loaded.length > 0 && !activeChatId) {
        setActiveChatId(loaded[0].chatId);
      }
    });

    return () => unsubscribe();
    // Abhängig von user
  }, [user, activeChatId]);

  // 5) Hilfsfunktion, um bestimmte Kategorien zu holen
  function getCategoryEntries(name: string) {
    return (
      userData?.matchSettings?.categories.find(
        (cat) => cat.categoryName === name
      )?.categoryEntries || []
    );
  }

  // 6) Rolle
  const role = userData?.role || "Talent";

  // 7) Loading / Auth-Check
  if (loadingAuth || loadingData) {
    return <LoadingIcon />;
  }
  if (!user) {
    return <div>Bitte melde dich an, um dein Dashboard zu sehen.</div>;
  }

  return (
    <div>
      <div className="flex flex-col w-full ">
        <DashboardCard className="flex-grow flex flex-col px-4 pt-4 pb-4">
          <h2 className="text-xl">Matches</h2>

          <div className="flex flex-1 mt-4">
            {/* Unterscheide: chats === null, [] oder >0 */}
            {chats === null ? (
              // Noch nicht geladen
              <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-gray-500">
                <p>Chats werden geladen...</p>
              </div>
            ) : chats.length === 0 ? (
              // Keine Chats
              <div className="flex flex-col items-center justify-center flex-1 text-center p-4 text-green-600">
                {/* Icon */}
                <svg
                  className="w-5 h-5 text-green-500 animate-spin mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span className="text-green-500 font-semibold mt-2">
                  Wir sind aktuell auf der Suche nach einem passenden Match.
                </span>
              </div>
            ) : (
              // Chats vorhanden => 2-Spalten
              <>
                <div className="w-1/2 border-r border-gray-300">
                  {/* ChatList kriegt hier ALLE chats als props -> kein eigner DB-Load */}
                  <ChatList
                    chats={chats}
                    onChatSelect={(chatId) => setActiveChatId(chatId)}
                  />
                </div>
                <div className="w-2/3 flex flex-col">
                  {activeChatId ? (
                    <Chat activeChatId={activeChatId} />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Wähle einen Chat aus der Liste.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
