"use client";

import React, { useState } from "react";
// Änderung: Verwendung von useRouter aus next/navigation (Next.js 13) anstelle von next/router
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/utils/errorHandler";
import { FirebaseError } from "firebase/app";

// Neu: Import des authService
import { authService } from "@/services/authService";

// Neu: Import der Shadcn UI-Komponenten
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const router = useRouter();

  // States für die Eingabefelder
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender] = useState(""); // Optional: Gender, falls benötigt
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States für Fehler und Loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Funktion, die die Registrierung übernimmt
  const handleRegister = async () => {
    setLoading(true);
    setError("");

    if (!firstName || !lastName || !email || !password) {
      setError("Bitte fülle alle Felder aus.");
      setLoading(false);
      return;
    }

    try {
      // Wichtiger Hinweis: Aufruf des authService anstatt direkter Firebase-Funktionen
      await authService.register({
        firstName,
        lastName,
        email,
        password,
        gender, // Wird nur verwendet, falls benötigt
      });

      // Weiterleitung nach erfolgreicher Registrierung
      router.push("/setup");
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
        setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Verwendung der Shadcn UI Card-Komponente anstelle von AuthCard
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle>Registrieren</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Vorname */}
          <div>
            <Input
              id="firstName"
              placeholder="Vorname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          {/* Nachname */}
          <div>
            <Input
              id="lastName"
              placeholder="Nachname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          {/* E-Mail */}
          <div>
            <Input
              id="email"
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Passwort */}
          <div>
            <Input
              id="password"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        {/* Fehlermeldung */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleRegister} disabled={loading} className="w-full">
          {loading ? "Registriere..." : "Registrieren"}
        </Button>
      </CardFooter>
    </Card>
  );
}
