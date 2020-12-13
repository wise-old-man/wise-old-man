export function buildQuery(params: any): any {
  const query: any = {};

  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) {
      query[k] = params[k];
    }
  });

  return query;
}
