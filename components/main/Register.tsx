// Register.tsx
import React, { useState } from "react";
import EmailInput from "../elements/Inputs/EmailInput";
import PasswordInput from "../elements/Inputs/PasswordInput";
import AuthCard from "../elements/cards/AuthCard";
import TextInput from "../elements/Inputs/TextInput";
import router from "next/router";
import { getErrorMessage } from "@/utils/errorHandler";
import { FirebaseError } from "firebase/app";

// Neu: importiere deinen authService
import { authService } from "@/services/authService";

export default function Register() {
  // States for input fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender] = useState(""); //
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States for error and loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Function responsible for registration
  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("Bitte fülle alle Felder aus.");
      setLoading(false);
      return;
    }

    try {
      // Wichtig: nur noch den authService aufrufen, anstatt direkt Firebase-Funktionen
      await authService.register({
        firstName,
        lastName,
        email,
        password,
        gender, // <--- Falls du es verwenden möchtest
      });

      // Weiterleitung nach erfolgreicher Registrierung
      router.push("/setup");
    } catch (err: unknown) {
      // Fehlerbehandlung wie bisher
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        typeof (err as FirebaseError).code === "string"
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
        {/* Geschlecht (optional) */}
        {/* Beispiel-Select falls du Gender abfragen möchtest */}
        {/* 
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
        */}
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
