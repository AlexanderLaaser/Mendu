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
import { Send } from "lucide-react"; // oder "PaperPlane" etc.

interface MessageInputProps {
  chatId: string | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [text, setText] = useState("");
  const { user } = useAuth();

  const sendMessage = async () => {
    if (!user || !chatId || text.trim() === "") return;

    try {
      // Neue Nachricht in Firestore
      const newMessage = {
        senderId: user.uid,
        text: text.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "chats", chatId, "messages"), newMessage);

      // lastMessage aktualisieren
      const chatDocRef = doc(db, "chats", chatId);
      await setDoc(
        chatDocRef,
        {
          lastMessage: {
            text: text.trim(),
            senderId: user.uid,
            createdAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      setText("");
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-3 border-t border-gray-300 bg-white">
      <div className="flex">
        <input
          type="text"
          className="flex-1 input input-bordered text-sm"
          placeholder="Nachricht eingeben..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary ml-2 flex items-center justify-center"
          onClick={sendMessage}
          disabled={!text.trim()}
        >
          {/* Icon statt Text */}
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
