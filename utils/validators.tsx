export const validateEmail = (email: string): boolean => {
  // Einfache E-Mail-Validierung
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Beispiel: Passwort muss mindestens 6 Zeichen lang sein
  return password.length >= 6;
};
