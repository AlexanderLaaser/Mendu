import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User } from "../models/user";

export const authService = {
  // -----------------------------------------------
  // 1. E-Mail / Passwort Login
  // -----------------------------------------------
  login: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Firestore-Dokument lesen
      const userRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        // Daten gemäß neuem User-Interface aus Firestore zuordnen
        const data = docSnap.data() as Partial<User>;

        // Zusammensetzen des User-Objekts
        const user: User = {
          uid: firebaseUser.uid,
          createdAt: data.createdAt ?? new Date(), // oder data.createdAt
          role: data.role,
          setupComplete: data.setupComplete ?? false,
          personalData: data.personalData ?? {
            firstName: "",
            lastName: "",
            email: firebaseUser.email ?? "",
            gender: "",
          },
          matchSettings: data.matchSettings ?? {
            categories: [],
          },
        };

        return user;
      } else {
        // Falls kein Dokument existiert, legen wir ein Basis-Dokument an
        const newUser: User = {
          uid: firebaseUser.uid,
          createdAt: new Date(),
          setupComplete: false,
          personalData: {
            firstName: "",
            lastName: "",
            email: firebaseUser.email ?? "",
            gender: "",
          },
          matchSettings: {
            categories: [],
          },
        };
        await setDoc(userRef, newUser);
        return newUser;
      }
    } catch (error) {
      throw error;
    }
  },

  // -----------------------------------------------
  // 2. Google Login
  // -----------------------------------------------
  loginWithGoogle: async (): Promise<User> => {
    const authInstance = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authInstance, provider);

    const firebaseUser = result.user;

    // Extrahiere Benutzerdaten
    const displayName = firebaseUser.displayName || "";
    const email = firebaseUser.email || "";
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ").trim();

    // Firestore-Dokument lesen
    const userRef = doc(db, "users", firebaseUser.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<User>;

      // Zusammensetzen des User-Objekts
      const user: User = {
        uid: firebaseUser.uid,
        createdAt: data.createdAt ?? new Date(),
        setupComplete: data.setupComplete ?? false,
        role: data.role,
        personalData: {
          firstName: data.personalData?.firstName ?? firstName,
          lastName: data.personalData?.lastName ?? lastName,
          email: data.personalData?.email ?? email,
          gender: data.personalData?.gender ?? "",
        },
        matchSettings: data.matchSettings ?? {
          categories: [],
        },
      };
      await setDoc(userRef, user, { merge: true });
      return user;
    } else {
      // Neues Dokument anlegen
      const newUser: User = {
        uid: firebaseUser.uid,
        createdAt: new Date(),
        setupComplete: false,
        personalData: {
          firstName,
          lastName,
          email,
          gender: "",
        },
        matchSettings: {
          categories: [],
        },
      };
      await setDoc(userRef, newUser, { merge: true });
      return newUser;
    }
  },

  // -----------------------------------------------
  // 3. Registrierung
  // -----------------------------------------------
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

      // Neues User-Objekt nach Interface
      const newUser: User = {
        uid: firebaseUser.uid,
        createdAt: new Date(),
        setupComplete: false,
        personalData: {
          firstName,
          lastName,
          email,
          gender,
        },
        matchSettings: {
          categories: [],
        },
      };

      // Zusätzliche Benutzerdaten in Firestore speichern
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);

      return newUser;
    } catch (error) {
      throw error;
    }
  },
};
