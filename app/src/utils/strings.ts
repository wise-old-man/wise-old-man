export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a username into a standardized version,
 * replacing any special characters, and forcing lower case.
 *
 * "Psikoi" -> "psikoi",
 * "Hello_world  " -> "hello world"
 */
export function standardizeUsername(username: string): string {
  if (!username || typeof username !== "string") return "";
  return sanitizeUsername(username).toLowerCase();
}

function sanitizeUsername(username: string): string {
  return username.replace(/[-_\s]/g, " ").trim();
}

/**
 * Get a number's Ordinal Suffix
 * 1 -> "st"
 * 2 -> "nd"
 * 3 -> "rd"
 */
export const getOrdinalSuffix = (number: number) => {
  if (number % 10 == 1 && number % 100 != 11) {
    return "st";
  }
  if (number % 10 == 2 && number % 100 != 12) {
    return "nd";
  }
  if (number % 10 == 3 && number % 100 != 13) {
    return "rd";
  }

  return "th";
};
