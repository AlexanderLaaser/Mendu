import { Timestamp } from 'firebase/firestore';

export interface Match {
    matchId: string;                  // Firestore-Dokument ID oder generiert
    talentUid: string;
    insiderUid: string;        // erst null, bis Termin wirklich vorgeschlagen
    matchParameters: {                // optional: was gematcht wurde
      company: string;
      position: string;
      industry: string;
    };
    status: "FOUND" 
          | "CALENDAR_NEGOTIATION" 
          | "CONFIRMED" 
          | "CANCELLED" 
          | "EXPIRED";              
    createdAt: Timestamp;
    updatedAt: Timestamp;
    proposedTimes?: ProposedTime[]; 
    acceptedTime?: ProposedTime;
  }

  export interface ProposedTime {
    date: string;    // "2025-05-14"
    time: string;    // "15:00"
    byUid: string;   
  }
  