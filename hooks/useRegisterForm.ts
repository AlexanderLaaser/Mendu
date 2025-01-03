import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import {
  validateEmail,
  validateFirstName,
  validateGender,
  validateLastName,
  validatePassword,
} from "@/utils/validators";
import { getErrorMessage } from "@/utils/errorHandler";
import { User } from "@/models/user";

export const useRegisterForm = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Zustände für Fehler- und Ladezustand
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    // Validierungen
    if (!validateFirstName(firstName)) {
      setError("Bitte gib einen gültigen Vornamen ein.");
      setLoading(false);
      return;
    }

    if (!validateLastName(lastName)) {
      setError("Bitte gib einen gültigen Nachnamen ein.");
      setLoading(false);
      return;
    }

    if (!validateGender(gender)) {
      setError("Bitte wähle ein gültiges Geschlecht aus.");
      setLoading(false);
      return;
    }

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
      const user: User = await authService.register({
        email,
        password,
        firstName,
        lastName,
        gender,
      });
      console.log("Registrierter Benutzer:", user);
      router.push("/dashboard"); // Passe den Pfad an
    } catch (err: any) {
      console.error("Fehler bei der Registrierung:", err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    gender,
    setGender,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleRegister,
  };
};
