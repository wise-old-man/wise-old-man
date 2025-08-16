export function chunkArray<T>(array: Array<T>, chunkSize: number): Array<Array<T>> {
  if (chunkSize <= 0) {
    throw new Error('chunkSize must be greater than 0');
  }

  const result: Array<Array<T>> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}
