export interface Chat {
    chatId: string;                 
    participants: string[];         
    createdAt: Date;                 
    lastMessage?: MessageSummary;    
    insiderCompany?  : string; 
    matchId?: string;                 
    locked?: boolean;        
  }
  
  export interface Message {
    messageId: string;               // Firestore-Dokument-ID
    senderId: string;                // ID des Absenders
    text: string;                    // Nachrichtentext
    createdAt: Date;                 // Sendezeitpunkt
    readBy?: string[];               // IDs der Nutzer, die die Nachricht gelesen haben
    type: "SYSTEM" | "CALENDAR" | "TEXT"; 
  }
  
  interface MessageSummary {
    text: string;
    senderId: string;
    createdAt: Date;
  }
  