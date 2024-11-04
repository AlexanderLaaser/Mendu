"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export default function Register() {
  const router = useRouter();

  // Zustände für die Eingabefelder
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Zustände für Fehler- und Ladezustand
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Funktion die die Registrierung verantwortet
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
    } catch (err) {
      setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="card w-96 bg-base-100 shadow-xl mt-20 mb-20">
        <div className="card-body">
          <h2 className="card-title">Registrieren</h2>
          <div className="items-center mt-2">
            {/* Vorname */}
            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="text"
                  className="grow"
                  placeholder="Vorname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
            </div>
            {/* Nachname */}
            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="text"
                  className="grow"
                  placeholder="Nachname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>
            {/* Geschlecht */}
            <div className="mb-4">
              <label className="label">
                <span className="label-text">Geschlecht</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="Mann">Mann</option>
                <option value="Frau">Frau</option>
                <option value="Divers">Divers</option>
              </select>
            </div>
            {/* E-Mail */}
            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-2">
                {/* E-Mail-Icon */}
                <input
                  type="email"
                  className="grow"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            {/* Passwort */}
            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-2">
                {/* Passwort-Icon */}
                <input
                  type="password"
                  className="grow"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary w-full"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Registriere..." : "Registrieren"}
            </button>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
