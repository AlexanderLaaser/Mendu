export interface Offer {
    id: string;
    uid: string;
    userRole: "Talent" | "Insider";
    firstNameCreator: string;
    company?: string;
    position: string;
    description: string;
    link: string;
    skills: string[];
    leadershipLevel: string;
    requestedBy?: string[];
}