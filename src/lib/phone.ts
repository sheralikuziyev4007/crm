import { LIMITS } from "./constants";

// International phone numbers (E.164: "+", country code, up to 15 digits in total).
// Spaces, dashes, dots and brackets are allowed for readability: +1 (415) 555-0132, +44 20 7946 0123.

const ALLOWED = /^\+[\d\s().-]+$/;

export const PHONE_HINT = "Include the country code, e.g. +1 415 555 0132";

export const phoneDigits = (value: string): string => value.replace(/\D/g, "");

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!ALLOWED.test(trimmed)) return false;
  const digits = phoneDigits(trimmed);
  return (
    !digits.startsWith("0") &&
    digits.length >= LIMITS.phoneDigitsMin &&
    digits.length <= LIMITS.phoneDigitsMax
  );
}

/** Tidies what the user typed without changing the number: single spaces, no stray separators. */
export function normalizePhone(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^\+\s+/, "+");
}

/** A tel: link target: "+14155550132" */
export const telHref = (value: string): string => `tel:+${phoneDigits(value)}`;
