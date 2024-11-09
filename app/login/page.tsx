"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/authService";
import { validateEmail, validatePassword } from "../../utils/validators";
import { getErrorMessage } from "../../utils/errorHandler";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Bitte eine gültige E-Mail-Adresse eingeben.");
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    try {
      const user = await authService.login(email, password);
      console.log("Angemeldeter Benutzer:", user);
      router.push("/dashboard");
    } catch (err) {
      console.error("Fehler bei der Anmeldung:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="card w-96 bg-base-100 shadow-xl mt-20 mb-20">
        <div className="card-body">
          <h2 className="card-title">Login</h2>
          <div className="items-center mt-2">
            {/* E-Mail-Eingabefeld */}
            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-2">
                {/* E-Mail-Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="email"
                  className="grow"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            {/* Passwort-Eingabefeld */}
            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-2">
                {/* Passwort-Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
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
          {/* Fehlermeldung */}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {/* Frage nach Registrierung */}
          <div className="mb-4 text-sm text-center">
            <span>
              Du hast noch kein Konto?{" "}
              <a href="/register" className="text-blue-500 underline">
                Hier registrieren
              </a>
            </span>
          </div>
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Anmeldung..." : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
