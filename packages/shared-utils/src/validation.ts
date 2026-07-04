import { REGEX, VALIDATION } from '@spiced-dayhome/shared-constraints';

export function isValidEmail(email: string): boolean {
  return REGEX.EMAIL.test(email);
}

export function isValidPhone(phone: string): boolean {
  return REGEX.PHONE.test(phone);
}

export function isValidPostalCode(code: string): boolean {
  return REGEX.POSTAL_CODE_CANADA.test(code);
}

export function isValidUUID(uuid: string): boolean {
  return REGEX.UUID.test(uuid);
}

export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < REGEX.PASSWORD_MIN_LENGTH) {
    errors.push(`Must be at least ${REGEX.PASSWORD_MIN_LENGTH} characters`);
  }
  if (!REGEX.PASSWORD_UPPERCASE.test(password)) {
    errors.push('Must contain an uppercase letter');
  }
  if (!REGEX.PASSWORD_LOWERCASE.test(password)) {
    errors.push('Must contain a lowercase letter');
  }
  if (!REGEX.PASSWORD_DIGIT.test(password)) {
    errors.push('Must contain a number');
  }
  if (!REGEX.PASSWORD_SPECIAL.test(password)) {
    errors.push('Must contain a special character');
  }
  return { valid: errors.length === 0, errors };
}

export function isValidPIN(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

export function isValidFileType(mime: string): boolean {
  return VALIDATION.FILE_ALLOWED_MIME.includes(mime);
}

export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
