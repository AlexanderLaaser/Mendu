export const getErrorMessage = (error: any): string => {
  if (error.code) {
    switch (error.code) {
      case "auth/user-not-found":
        return "Benutzer nicht gefunden.";
      case "auth/wrong-password":
        return "Falsches Passwort.";
      case "auth/invalid-email":
        return "Ungültige E-Mail-Adresse.";
      default:
        return "Ein unbekannter Fehler ist aufgetreten.";
    }
  }
  return "Ein Fehler ist aufgetreten.";
};
