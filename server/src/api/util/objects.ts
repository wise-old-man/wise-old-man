export function omit<T extends object, K extends keyof T>(
  object: T,
  ...fields: K[]
): Pick<T, Exclude<keyof T, K>> {
  const clone = { ...object };

  fields.forEach(f => {
    delete clone[f as keyof object];
  });

  return clone;
}

export function mapValues<T extends object, TResult>(
  obj: T,
  callback: (value: T[keyof T], key: keyof T, collection: T) => TResult
): { [P in keyof T]: TResult } {
  const clone = {} as { [P in keyof T]: TResult };

  Object.keys(obj).forEach(k => {
    const key = k as keyof T;
    clone[key] = callback(obj[key], key, obj);
  });

  return clone as { [P in keyof T]: TResult };
}

// Sequential alternative to Promise.all
// Note: The types for this really only work if all promises return the same awaited type
export async function resolveSequentially<T>(promises: Array<Promise<T>>): Promise<T[]> {
  const results: T[] = [];

  for (const promise of promises) {
    results.push(await promise);
  }

  return results;
}
