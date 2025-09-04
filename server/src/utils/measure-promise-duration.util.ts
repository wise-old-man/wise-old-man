export async function measurePromiseDuration<T>(label: string, promise: Promise<T>): Promise<T> {
  console.time(label);
  const result = await promise;
  console.timeEnd(label);

  return result;
}
