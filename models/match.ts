import { Timestamp } from 'firebase/firestore';

export interface Match {
  id: string;
  talentUid: string;
  insiderUid: string;
  matchParameters: {
    company: string;
    position: string;
  };
  type: "DIRECT" | "MARKETPLACE"
  status: "FOUND" 
        | "CONFIRMED" 
        | "CANCELLED" 
        | "EXPIRED";
  talentAccepted: boolean;
  insiderAccepted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  chatId?: string;
}
