export interface User {
  uid?: string;
  createdAt?: Date;
  role?: "Talent" | "Insider";
  setupComplete?: boolean | null;
  personalData?: personalData;
  matchSettings?: MatchSettings;
  
}

export interface personalData {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthDate?: string;
  location?: string;
  postalCode?: string;
  languages?: languages[];
}

export interface MatchSettings {
  categories: MatchCategory[];
  searchImmediately?: boolean;
  furtherCompaniesRecommended?: boolean;
  leadershipLevel?: string;
}

export interface MatchCategory {
  categoryName: string;
  categoryEntries: string[];
}

export interface languages {
  checked: boolean;
  language: string;
  level: string;
}
