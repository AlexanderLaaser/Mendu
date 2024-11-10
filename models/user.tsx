// src/models/user.ts

export interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  // Weitere Felder nach Bedarf
}
