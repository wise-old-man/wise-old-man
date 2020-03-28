export function toMap(array, key) {
  const obj = {};

  array.forEach(c => {
    obj[c[key]] = c;
  });

  return obj;
}
