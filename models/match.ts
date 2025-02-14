import { Timestamp } from 'firebase/firestore';

export interface Match {
  id: string;
  talentUid: string;
  insiderUid: string;
  matchParameters: {
    company: string;
    positions: string[];
    skills: string[];
  };
  type: "DIRECT" | "MARKETPLACE"
  status: "FOUND" 
        | "CONFIRMED" 
        | "CANCELLED" 
        | "CLOSED" 
        | "EXPIRED";
  talentAccepted: boolean;
  insiderAccepted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  chatId?: string;
  matchFactor: number;
}
