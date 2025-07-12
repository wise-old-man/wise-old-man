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
