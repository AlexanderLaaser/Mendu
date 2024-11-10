import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { auth, db, doc, setDoc } from "../firebase";
import { User } from "../models/user";

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        // Weitere Zuordnungen
      };

      return user;
    } catch (error) {
      // Fehler weiterwerfen, um sie in der Login-Komponente zu behandeln
      throw error;
    }
  },
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
  }): Promise<User> => {
    try {
      const { email, password, firstName, lastName, gender } = userData;
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const user: User = {
        uid: firebaseUser.uid,
        email,
        firstName,
        lastName,
        gender,
        createdAt: new Date(),
      };

      // Zusätzliche Benutzerdaten in Firestore speichern
      await setDoc(doc(db, "users", firebaseUser.uid), user);

      return user;
    } catch (error) {
      throw error;
    }
  },
};
