export function buildQuery(params: any): any {
  const query: any = {};

  Object.keys(params).forEach(k => {
    if (
      params[k] !== undefined &&
      params[k] !== null &&
      (typeof params[k] !== 'string' || params[k].length > 0)
    ) {
      query[k] = params[k];
    }
  });

  return query;
}
