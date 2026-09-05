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
  return username
    .replace(/[-_\s]/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Sanitize display name to only allow letters, numbers, spaces, dashes and underscores.
 * Removes spaces from start and end, but allows consecutive spaces in the middle.
 */
export function sanitizeDisplayName(username: string): string {
  return username
    .replace(/[^a-zA-Z0-9 \-_]/g, "") // Remove any character that's NOT letter, number, space, dash, or underscore
    .trim(); // Remove spaces from start and end
}

/**
 * Prefix a word with a count, and add an "s" to the word if the count is not 1.
 *
 * (1, "team") -> "1 team",
 * (3, "participant") -> "3 participants"
 */
export function naivePluralize(count: number, word: string): string {
  return count === 1 ? `${count} ${word}` : `${count} ${word}s`;
}
