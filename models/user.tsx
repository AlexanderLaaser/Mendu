export interface User {
  uid: string;
  createdAt?: Date;
  role?: "Talent" | "Insider";
  setupComplete?: boolean;
  personalData?: personalData;
  matchSettings?: MatchSettings;
}

export interface personalData {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
}

export interface MatchSettings {
  categories: MatchCategory[];
}

export interface MatchCategory {
  categoryName: string;
  categoryEntries: string[];
}
