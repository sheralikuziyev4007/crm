const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/** Turns anything that was thrown into a message that is safe to show to the user. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : FALLBACK_MESSAGE;
}
