import { useRouter } from "next/navigation";
import React, { useState } from "react";
import EmailInput from "../Inputs/EmailInput";
import PasswordInput from "../Inputs/PasswordInput";
import AuthCard from "../../components/cards/AuthCard"; // Import the AuthCard component
import TextInput from "../Inputs/TextInput"; // Create this component
import SelectInput from "../Inputs/SelectInput"; // Create this component
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import router from "next/router";
import { getErrorMessage } from "@/utils/errorHandler";
import { FirebaseError } from "firebase/app";

export default function Register() {
  // States for input fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States for error and loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Function responsible for registration
  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (!firstName || !lastName || !gender || !email || !password) {
      setError("Bitte fülle alle Felder aus.");
      setLoading(false);
      return;
    }

    try {
      // Benutzer mit E-Mail und Passwort registrieren
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Zusätzliche Benutzerdaten in Firestore speichern
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        email: email,
        createdAt: new Date(),
      });

      // Weiterleitung nach erfolgreicher Registrierung
      router.push("/dashboard"); // Passe den Pfad an
    } catch (err: unknown) {
      // Type guard to check if err is a FirebaseError
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        typeof (err as any).code === "string"
      ) {
        const errorMessage = getErrorMessage(err as FirebaseError);
        setError(errorMessage);
      } else {
        setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Registrieren">
      <div className="items-center mt-2">
        {/* Vorname */}
        <TextInput
          placeholder="Vorname"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        {/* Nachname */}
        <TextInput
          placeholder="Nachname"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        {/* Geschlecht */}
        <SelectInput
          label="Geschlecht"
          options={[
            { value: "Mann", label: "Mann" },
            { value: "Frau", label: "Frau" },
            { value: "Divers", label: "Divers" },
          ]}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        />
        {/* E-Mail */}
        <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} />
        {/* Passwort */}
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {/* Error Message */}
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="card-actions justify-end">
        <button
          className="btn btn-primary w-full"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registriere..." : "Registrieren"}
        </button>
      </div>
    </AuthCard>
  );
}
