export interface JobOfferEntry {
    company: string;
    position: string;
    description: string;
    referralLink: string;
  }

  export interface JobOffers {
    uid: string;
    company: string;
    position: string;
    description: string;
    referralLink: string;
    JobOfferEntries: JobOfferEntry[];
  }