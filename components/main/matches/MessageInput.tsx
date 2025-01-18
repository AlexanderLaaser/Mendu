// MessageInput.tsx
"use client";

import React, { useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Send } from "lucide-react";
import GoogleMeetIcon from "../../../public/google-meet.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  chatId: string | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [text, setText] = useState("");
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [meetLinkInput, setMeetLinkInput] = useState("");

  const { user } = useAuth();

  const sendMessage = async (msg: string) => {
    if (!user || !chatId || msg.trim() === "") return;

    try {
      const newMessage = {
        senderId: user.uid,
        text: msg.trim(),
        createdAt: serverTimestamp(),
        readBy: [],
        type: "TEXT",
      };

      await addDoc(collection(db, "chats", chatId, "messages"), newMessage);

      const chatDocRef = doc(db, "chats", chatId);
      await setDoc(
        chatDocRef,
        {
          lastMessage: {
            text: msg.trim(),
            senderId: user.uid,
            createdAt: serverTimestamp(),
          },
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
    }
  };

  const handleSendMessage = () => {
    sendMessage(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateMeetLink = () => {
    if (!user || !chatId) return;

    // Öffnet den neuen Google Meet Raum in einem neuen Tab
    window.open("https://meet.google.com/new", "_blank");

    // Zeigt das Modal, in dem User 1 den Link einfügen kann
    setIsMeetModalOpen(true);
  };

  const handleSubmitMeetLink = () => {
    if (!meetLinkInput.trim()) return;

    // Nachricht mit dem eingegebenen Meet-Link erstellen
    const messageContent = `
Neuer Meetingraum – Startet jetzt für 60 Minuten  
**Google Meet**
[](${meetLinkInput.trim()})
    `;
    sendMessage(messageContent);

    // Zurücksetzen und Modal schließen
    setMeetLinkInput("");
    setIsMeetModalOpen(false);
  };

  return (
    <div className="p-3 border-t border-gray-300 bg-white relative">
      <div className="flex items-center">
        <input
          type="text"
          className="flex-1 input input-bordered text-sm"
          placeholder="Nachricht eingeben..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Button
          className=" ml-2 flex items-center justify-center h-12"
          onClick={handleCreateMeetLink}
          disabled={!chatId}
          title="Neuen Google Meet Raum erstellen"
        >
          <Image
            src={GoogleMeetIcon}
            alt="Company Logo"
            width={30}
            height={30}
            className="rounded-full"
          />
        </Button>

        <Button
          className="ml-2 flex items-center justify-center h-12 w-16"
          onClick={handleSendMessage}
          disabled={!text.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Modal für die Eingabe des Meet-Links */}
      <Dialog open={isMeetModalOpen} onOpenChange={setIsMeetModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meet-Link teilen</DialogTitle>
            <DialogDescription>
              Füge hier den von Google Meet generierten Link ein, um ihn mit
              anderen zu teilen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="https://meet.google.com/..."
              value={meetLinkInput}
              onChange={(e) => setMeetLinkInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmitMeetLink}
              disabled={!meetLinkInput.trim()}
            >
              Link teilen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageInput;
