import { Timestamp } from "firebase/firestore";

export interface Chat {
  id: string;
  participants: string[];
  insiderCompany?: string;
  matchId: string;
  createdAt: Timestamp;
  locked?: boolean;
  lastMessage?: MessageSummary;
  type: "DIRECT" | "MARKETPLACE"
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  readBy?: string[];
  type: "SYSTEM" | "CALENDAR" | "TEXT";
  // Für Systemnachrichten
  recipientUid?: string;
}

interface MessageSummary {
  text: string;
  senderId: string;
  createdAt: Timestamp;
}
