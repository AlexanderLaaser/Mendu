"use client";

import React, { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useSendMessage } from "@/hooks/useSendMessages";

interface MessageInputProps {
  chatId: string | null;
  isDisabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId, isDisabled }) => {
  const [text, setText] = useState("");
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const { sendMessage } = useSendMessage();
  const { user } = useAuth();

  const handleSendMessage = async () => {
    await sendMessage({ chatId: chatId!, text });
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
    window.open("https://meet.google.com/new", "_blank");
    setIsMeetModalOpen(true);
  };

  const handleSubmitMeetLink = () => {
    if (!meetLinkInput.trim()) return;

    const messageContent = `
Neuer Meetingraum – Startet jetzt für 60 Minuten  
**Google Meet**
[](${meetLinkInput.trim()})
    `;
    sendMessage({ chatId: chatId!, text: messageContent });
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
          disabled={isDisabled}
        />

        <Button
          className="ml-2 flex items-center justify-center h-12"
          onClick={handleCreateMeetLink}
          disabled={!chatId || isDisabled}
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
          disabled={!text.trim() || isDisabled}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

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
