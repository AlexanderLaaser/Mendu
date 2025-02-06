import { Timestamp } from "firebase/firestore";

export interface Chat {
  id: string;
  participants: string[];
  insiderCompany?: string;
  matchId: string;
  createdAt: Timestamp;
  lastMessage?: MessageSummary;
  type: "DIRECT" | "MARKETPLACE"
  messages: Message[];
}

export interface Message {
  id?: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  readBy?: string[];
  type: "SYSTEM" | "CALENDAR" | "TEXT";
  recipientUid?: string[];
}

export interface MessageSummary {
  text: string;
  senderId: string;
  createdAt: Timestamp;
}
