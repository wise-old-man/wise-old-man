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
 * 4 - 20 -> "th"
 */
export const getOrdinalSuffix = (number: number) => {
  if (number > 3 && number < 21) return "th";
  switch (number % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};
