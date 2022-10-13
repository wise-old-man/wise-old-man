import { PERIODS } from '@wise-old-man/utils';
import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchLeaderboards = (metric, period, type, build, country) => async dispatch => {
  dispatch(reducers.onFetchLeaderboardsRequest({ period }));

  try {
    const params = { metric, period, playerType: type, playerBuild: build, country };
    const { data } = await api.get(endpoints.fetchDeltasLeaderboards, { params });

    dispatch(reducers.onFetchLeaderboardsSuccess({ period, data }));
  } catch (e) {
    dispatch(reducers.onFetchLeaderboardsError({ period, error: e.message.toString() }));
  }
};

const fetchPlayerDeltas =
  (username, startDate = null, endDate = null) =>
  async dispatch => {
    dispatch(reducers.onFetchPlayerDeltasRequest());

    if (!startDate && !endDate) {
      try {
        const result = await Promise.all(
          PERIODS.map(async period => {
            const url = endpoints.fetchPlayerDeltas.replace(':username', username);
            const params = { period };

            const { data } = await api.get(url, { params });

            return { period, data };
          })
        );

        const mappedResponse = Object.fromEntries(result.map(r => [r.period, r.data]));

        dispatch(reducers.onFetchPlayerDeltasSuccess({ username, data: mappedResponse }));
      } catch (e) {
        dispatch(reducers.onFetchPlayerDeltasError(e.message.toString()));
      }
    } else {
      try {
        const url = endpoints.fetchPlayerDeltas.replace(':username', username);
        const params = { startDate, endDate };

        const { data } = await api.get(url, { params });

        dispatch(reducers.onFetchPlayerDeltasSuccess({ username, data }));
      } catch (e) {
        dispatch(reducers.onFetchPlayerDeltasError(e.message.toString()));
      }
    }
  };

const fetchGroupPeriodDeltas = (groupId, metric, period, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchGroupDeltasRequest());

  try {
    const params = { metric, period, limit, offset };
    const url = endpoints.fetchGroupDeltas.replace(':id', groupId);

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchGroupDeltasSuccess({ groupId, data, refresh: !offset }));
  } catch (e) {
    dispatch(reducers.onFetchGroupDeltasError(e.message.toString()));
  }
};

const fetchGroupTimeRangeDeltas =
  (groupId, metric, startDate, endDate, limit, offset) => async dispatch => {
    dispatch(reducers.onFetchGroupDeltasRequest());

    try {
      const params = { metric, startDate, endDate, limit, offset };
      const url = endpoints.fetchGroupDeltas.replace(':id', groupId);

      const { data } = await api.get(url, { params });

      dispatch(reducers.onFetchGroupDeltasSuccess({ groupId, data, refresh: !offset }));
    } catch (e) {
      dispatch(reducers.onFetchGroupDeltasError(e.message.toString()));
    }
  };

const invalidateDeltas = (username, period) => async dispatch => {
  dispatch(reducers.onInvalidate({ username, period }));
};

export {
  fetchPlayerDeltas,
  fetchGroupPeriodDeltas,
  fetchGroupTimeRangeDeltas,
  fetchLeaderboards,
  invalidateDeltas
};
