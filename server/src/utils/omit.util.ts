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
