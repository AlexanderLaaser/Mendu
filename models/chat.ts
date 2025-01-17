import { Timestamp } from "firebase/firestore";

export interface Chat {
  chatId: string;
  participants: string[];
  insiderCompany?: string;
  matchId?: string;
  createdAt: Date;
  locked?: boolean;
  lastMessage?: MessageSummary;
}

export interface Message {
  messageId: string;
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
