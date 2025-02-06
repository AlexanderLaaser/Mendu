"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";

import { authService } from "@/services/authService";
import { getErrorMessage } from "@/utils/errorHandler";
import { validateEmail, validatePassword } from "@/utils/validators";

// Anpassung: Import der Shadcn UI-Komponenten statt eigener Elemente
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaGoogle } from "react-icons/fa";

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
      if (user.setupComplete) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        typeof (err as FirebaseError).code === "string"
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const user = await authService.loginWithGoogle();
      console.log("Signedin User:", user);
      if (user.setupComplete) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        typeof (err as FirebaseError).code === "string"
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
    // Anpassung: Verwendung der Shadcn UI Card-Komponente statt der AuthCard
    <Card className="max-w-md mx-auto mt-10">
      {/* <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="space-y-4">
          {/* Anpassung: Shadcn UI Input für E-Mail */}
          <div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail-Adresse"
            />
          </div>
          {/* Anpassung: Shadcn UI Input für Passwort */}
          <div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
            />
          </div>
        </div>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        <div className="mt-4 text-sm text-center">
          <span>
            Du hast noch kein Konto?{" "}
            <a href="#join" className="text-blue-500 underline">
              Hier registrieren
            </a>
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {/* Anpassung: Shadcn UI Button für Login */}
        <Button onClick={handleLogin} disabled={loading} className="w-full">
          {loading ? "Anmeldung..." : "Login"}
        </Button>
        {/* Anpassung: Shadcn UI Outline-Button für Google Login */}
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            "Anmeldung mit Google..."
          ) : (
            <>
              <FaGoogle className="w-4 h-4" /> {/* Google Icon */}
              Mit Google anmelden
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
