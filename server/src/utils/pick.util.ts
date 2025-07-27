export function pick<T extends object, K extends keyof T>(object: T, ...fields: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;

  fields.forEach(field => {
    if (field in object) {
      result[field] = object[field];
    }
  });

  return result;
}
