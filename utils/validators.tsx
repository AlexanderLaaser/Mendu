export const validateEmail = (email: string): boolean => {
  // Einfache E-Mail-Validierung
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Beispiel: Passwort muss mindestens 6 Zeichen lang sein
  return password.length >= 6;
};

export const validateFirstName = (firstName: string): boolean => {
  return firstName.trim().length > 0;
};

export const validateLastName = (lastName: string): boolean => {
  return lastName.trim().length > 0;
};

export const validateGender = (gender: string): boolean => {
  return ["Mann", "Frau", "Divers"].includes(gender);
};
