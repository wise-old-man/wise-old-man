import { useCallback } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';

function useQuery() {
  const location = useLocation();
  return queryString.parse(location.search);
}

function usePageContext(encodeToURL, decodeToContext) {
  const router = useHistory();
  const params = useParams();
  const query = useQuery();

  const context = decodeToContext(params, query);

  const updateContext = useCallback(
    opts => {
      router.push(encodeToURL({ ...context, ...opts }));
    },
    [router, context, encodeToURL]
  );

  return { context, updateContext };
}

export { useQuery, usePageContext };
