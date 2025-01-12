"use client";

import DashboardCard from "@/components/cards/DashboardCard";
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
import LoadingIcon from "@/components/icons/Loading";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import ChatList from "./ChatList";
import Chat from "./Chat";

export default function Matches() {
  const { user, loading: loadingAuth } = useAuth();
  const { userData, loadingData } = useUserData();

  // State für aktiven Chat
  const [ChatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatType[] | null>(null);
  const activeChat = chats?.find((c) => c.chatId === ChatId);
  const chatLocked = activeChat?.locked ?? true;
  const matchId = activeChat?.matchId ?? "";

  // "aktive Suche"
  const [, setActiveSearch] = useState<boolean>(false);
  const searchAbortRef = useRef<boolean>(false);

  // ------------------------------------------------
  // searchImmediately: Boolean aus userData
  // ------------------------------------------------
  const searchImmediately = userData?.matchSettings?.searchImmediately ?? false;

  // ------------------------------------------------
  // 1) Prüfen, ob alle Kategorien gefüllt sind
  // ------------------------------------------------
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

  // ------------------------------------------------
  // 2) useEffect -> Start Matching
  // ------------------------------------------------
  useEffect(() => {
    if (allCategoriesFilled && searchImmediately) {
      setActiveSearch(true);
      searchAbortRef.current = false;
      getMatch();
    } else {
      setActiveSearch(false);
      searchAbortRef.current = true;
    }
  }, [allCategoriesFilled, searchImmediately]);

  // ------------------------------------------------
  // 3) Minimales Matching
  // ------------------------------------------------
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
      if (result.success) {
        console.log("Match gefunden:", result.matchId);
        // => Du kannst result.chatId direkt in setActiveChatId stecken
        setChatId(result.chatId);
      } else {
        console.log("Kein Insider gefunden:", result.message);
        // Retry oder was du möchtest...
      }
    } catch (error) {
      console.error("Fehler beim Matching:", error);
    }
  }

  // ------------------------------------------------
  // 4) Chats in der DB laden (nur 1x, wenn user vorhanden)
  // ------------------------------------------------
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
          matchId: data.matchId ?? "",
          locked: data.locked ?? false,
        });
      });
      // State setzen
      console.log("Chats loaded:", loaded);
      setChats(loaded.length > 0 ? loaded : []);
      // Falls wir noch keinen activeChatId haben, aber mind. 1 Chat existiert
      if (loaded.length > 0 && !ChatId) {
        setChatId(loaded[0].chatId);
      }
    });

    return () => unsubscribe();
    // Abhängig von user
  }, [user, ChatId]);

  // ------------------------------------------------
  // 7) Loading / Auth-Check
  // ------------------------------------------------
  if (loadingAuth || loadingData) {
    return <LoadingIcon />;
  }
  if (!user) {
    return <div>Bitte melde dich an, um dein Dashboard zu sehen.</div>;
  }

  // ------------------------------------------------
  // JSX Return
  // ------------------------------------------------
  return (
    <div className="flex flex-col w-full gap-4">
      {/* OBERER BEREICH: Info über "searchImmediately" */}

      {searchImmediately ? (
        <DashboardCard className="mt-4 p-4 bg-green-100">
          <div className="flex items-center gap-2 text-green-600 ">
            <FaSpinner className="animate-spin text-green-500 " />
            <p className="font-semibold text-sm ">
              Suche ist aktiv - Wir suchen nach deinem Match!
            </p>
          </div>
        </DashboardCard>
      ) : (
        <DashboardCard className="mt-4 p-4 bg-red-100">
          <div className="flex items-center gap-2 text-red-600">
            <FaExclamationTriangle className="text-red-500" />
            <p className="font-semibold text-sm">Die Suche wurde ausgesetzt.</p>
          </div>
        </DashboardCard>
      )}

      {/* MATCHES - EIGENTLICHE CHATS */}
      <DashboardCard className="flex-grow flex flex-col px-4 pb-4 bg-white">
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
              <span className="text-black mt-2">Keine Matches vorhanden!</span>
            </div>
          ) : (
            // Chats vorhanden => 2-Spalten
            <>
              <div className="w-1/2 border-r border-gray-300">
                {/* ChatList kriegt hier ALLE chats als props -> kein eigener DB-Load */}
                <ChatList
                  chats={chats}
                  onChatSelect={(chatId) => setChatId(chatId)}
                />
              </div>
              <div className="w-2/3 flex flex-col">
                {ChatId ? (
                  <Chat
                    ChatId={ChatId}
                    matchId={matchId}
                    chatLocked={chatLocked}
                  />
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
  );
}
