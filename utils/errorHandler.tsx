import { FirebaseError } from "firebase/app";

export const getErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case "auth/user-not-found":
      return "Benutzer nicht gefunden.";
    case "auth/wrong-password":
      return "Falsches Passwort.";
    case "auth/invalid-email":
      return "Ungültige E-Mail-Adresse.";
    case "auth/user-disabled":
      return "Das Benutzerkonto wurde deaktiviert.";
    case "auth/too-many-requests":
      return "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.";
    case "auth/network-request-failed":
      return "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.";
    case "auth/invalid-credential":
      return "Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre Eingaben.";
    case "auth/email-already-in-use":
      return "Diese E-Mail-Adresse wird bereits verwendet.";
    case "auth/weak-password":
      return "Das Passwort ist zu schwach.";
    default:
      return `Fehler: ${error.code}`;
  }
};
