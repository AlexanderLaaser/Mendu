import { authService } from "@/services/authService";
import { getErrorMessage } from "@/utils/errorHandler";
import { validateEmail, validatePassword } from "@/utils/validators";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import EmailInput from "../Inputs/EmailInput";
import PasswordInput from "../Inputs/PasswordInput";
import { FirebaseError } from "firebase/app";
import AuthCard from "../cards/AuthCard";

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
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        typeof (err as any).code === "string"
      ) {
        const errorMessage = getErrorMessage(err as FirebaseError);
        setError(errorMessage);
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Login">
      <div className="items-center mt-2">
        <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {/* Error Message */}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {/* Registration Link */}
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
    </AuthCard>
  );
}
