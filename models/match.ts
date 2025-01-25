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
  talentAccepted: boolean;   // Ob das Talent akzeptiert hat
  insiderAccepted: boolean;  // Ob der Insider akzeptiert hat
  createdAt: Timestamp;
  updatedAt: Timestamp;
  chatIds?: string[];
}
