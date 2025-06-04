export function validateRegistration(email: string, password: string): string[] {
  const errors: string[] = []

  // Vérification de l’email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('Adresse email invalide')
  }

  // Longueur minimale
  if (password.length < 8) {
    errors.push('Mot de passe trop court (min. 8 caractères)')
  }

  // Doit contenir au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Mot de passe sans majuscule')
  }

  // Doit contenir au moins un chiffre
  if (!/\d/.test(password)) {
    errors.push('Mot de passe sans chiffre')
  }

  return errors
}
