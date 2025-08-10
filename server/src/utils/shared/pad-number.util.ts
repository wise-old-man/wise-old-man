export function padNumber(value: number): string {
  if (!value) return '00';
  return value < 10 ? `0${value}` : value.toString();
}
