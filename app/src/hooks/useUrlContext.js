import { useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import useQuery from './useQuery';

function useUrlContext(encodeToURL, decodeToContext) {
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

export default useUrlContext;
