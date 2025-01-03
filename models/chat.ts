export interface Chat {
    chatId: string;                  // Dokument-ID in Firestore
    participants: string[];          // Array von Benutzer-IDs
    createdAt: Date;                 // Zeitpunkt der Erstellung
    lastMessage?: MessageSummary;    // (Optional) Letzte Nachricht
    insiderCompany?  : string;        // z. B. aus partnerDoc.personalData?.company
  }
  
  export interface Message {
    messageId: string;               // Firestore-Dokument-ID
    senderId: string;                // ID des Absenders
    text: string;                    // Nachrichtentext
    createdAt: Date;                 // Sendezeitpunkt
    attachments?: string[];          // z.B. URLs zu Bildern, Dateien
    readBy?: string[];               // IDs der Nutzer, die die Nachricht gelesen haben
  }
  
  export interface MessageSummary {
    text: string;
    senderId: string;
    createdAt: Date;
  }
  