export function isValidPhone(phone: string) {
  return /^\+?[0-9()\-\s]{10,20}$/.test(phone.trim());
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
