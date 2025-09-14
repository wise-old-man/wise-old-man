export function sanitizeWhitespace(string: string) {
  return string.replace(/\s+/g, ' ').trim();
}
