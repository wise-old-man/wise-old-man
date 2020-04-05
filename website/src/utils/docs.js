export async function loadConfig(resource) {
  const file = await import(`../configs/docs/${resource}`);
  return file.default;
}
