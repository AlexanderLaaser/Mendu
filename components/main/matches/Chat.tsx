// components/Chat/ChatView.tsx
"use client";

import React, { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import DatePicker from "@/components/picker/DatePicker";
import TimePicker from "@/components/picker/TimePicker";

interface ChatProps {
  ChatId: string | null;
  matchId: string;
  chatLocked: boolean;
}

const Chat: React.FC<ChatProps> = ({ ChatId, matchId, chatLocked }) => {
  const { user } = useAuth();

  // Datum und Zeit werden nun als State verwaltet
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Beispielhafte Zeit-Slots im 30-Minuten-Takt von 9:00 bis 17:30
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // Beispielhafter Fetch-Aufruf zum ProposeTime-Endpoint
  const handleProposeTime = async () => {
    try {
      if (!user?.uid || !ChatId || !selectedDate || !selectedTime) return;
      const proposedDate = format(selectedDate, "yyyy-MM-dd");
      const proposedTime = selectedTime;

      const res = await fetch("/api/match/proposeTime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          chatId: ChatId,
          talentUid: user.uid,
          date: proposedDate,
          time: proposedTime,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        console.log("Termin vorgeschlagen:", data.message);
      } else {
        console.error("Fehler bei proposeTime:", data);
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  // Beispielhafter Fetch-Aufruf zum AcceptTime-Endpoint
  const handleAcceptTime = async () => {
    try {
      if (!user?.uid || !ChatId || !selectedDate || !selectedTime) return;
      const proposedDate = format(selectedDate, "yyyy-MM-dd");
      const proposedTime = selectedTime;

      const res = await fetch("/api/match/acceptTime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          chatId: ChatId,
          userUid: user.uid,
          date: proposedDate,
          time: proposedTime,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        console.log("Termin bestätigt:", data.message);
      } else {
        console.error("Fehler bei acceptTime:", data);
      }
    } catch (error) {
      console.error("Fehler:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Nachrichtenliste */}
      <MessageList chatId={ChatId} />

      {/* Wenn Chat gesperrt -> Nur Termin-Funktionen */}
      {chatLocked && (
        <div className="p-4 text-base">
          <div className="mb-2 font-bold">Bitte wähle deinen Termin aus:</div>

          {/* 
            2-spaltiges Layout (Datum und Zeiten nebeneinander) 
            mit Tailwind-Klasse gap-6 (Platz dazwischen)
          */}
          <div className="grid md:grid-cols-2 gap-6 w-full ">
            <DatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />

            <TimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
              timeSlots={timeSlots}
            />
          </div>

          {/* Ausgewählter Termin */}
          {selectedDate && selectedTime && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
              <p className="text-gray-700">
                Ausgewählter Termin:{" "}
                <strong>{format(selectedDate, "dd.MM.yyyy")}</strong> um{" "}
                <strong>{selectedTime} Uhr</strong>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-4">
            <button
              className="btn btn-primary"
              onClick={handleProposeTime}
              disabled={!selectedDate || !selectedTime}
            >
              Terminvorschlag abschicken
            </button>
            <button
              className="btn btn-secondary ml-2"
              onClick={handleAcceptTime}
              disabled={!selectedDate || !selectedTime}
            >
              Termin annehmen
            </button>
          </div>
        </div>
      )}

      {/* Ist der Chat entsperrt -> Normale Nachrichteneingabe */}
      {!chatLocked && <MessageInput chatId={ChatId} />}
    </div>
  );
};

export default Chat;
