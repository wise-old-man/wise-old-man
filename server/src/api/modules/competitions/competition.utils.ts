export function sanitizeTitle(title: string): string {
  return title
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}
