import { Timestamp } from 'firebase/firestore';

export interface Match {
  matchId: string;
  talentUid: string;
  insiderUid: string;
  
  matchParameters: {
    company: string;
    position: string;
  };

  status: "FOUND" 
        | "CONFIRMED" 
        | "CANCELLED" 
        | "EXPIRED";
  
  // Neu
  talentAccepted: boolean;   // Ob das Talent akzeptiert hat
  insiderAccepted: boolean;  // Ob der Insider akzeptiert hat

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
