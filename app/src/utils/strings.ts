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
