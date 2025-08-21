export function mapBy<T, K>(array: T[], fn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();

  for (const item of array) {
    const key = fn(item);

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(item);
  }

  return map;
}
