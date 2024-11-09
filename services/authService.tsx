import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { auth } from "../firebase";
import { User } from "../models/user";

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    const user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      photoURL: firebaseUser.photoURL || "",
      // Weitere Zuordnungen
    };

    return user;
  },
  // Weitere Auth-Methoden wie register, resetPassword etc.
};
