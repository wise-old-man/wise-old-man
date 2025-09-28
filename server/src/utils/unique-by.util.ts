export function uniqueBy<T, F extends string | number | boolean>(array: T[], fn: (item: T) => F): T[] {
  const map = new Map<string, T>();

  for (const i of array) {
    const uniqueKey = fn(i);
    map.set(String(uniqueKey), i);
  }

  return Array.from(map.values());
}
