/**
 * Regular expressions for common data validations.
 *
 * Notes:
 * - Keep patterns simple and readable (KISS) while covering core cases.
 * - These are used by DTOs and validators; avoid global flags for validation.
 * - Documented in English to match project standards.
 */

/**
 * Person name and lastname validation.
 * Allows letters (including accents), spaces, and Spanish-specific characters.
 */
export const PERSON_NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

/**
 * Strong password validation.
 * Requires at least: 1 lowercase, 1 uppercase, 1 number, and 1 special char.
 */
export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;

/**
 * Basic email validation.
 * Note: Zod already performs comprehensive email validation.
 */
export const EMAIL_BASIC_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * International phone number format (E.164-like, without strict length enforcement).
 */
export const PHONE_INTERNATIONAL_REGEX = /^\+[1-9]\d{2,14}$/;

/**
 * General postal code validation (numeric, 4 to 10 digits).
 */
export const POSTAL_CODE_REGEX = /^[0-9]{4,10}$/;

/**
 * URL validation for http/https including optional subdomain, path, query, and fragment.
 */
export const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;