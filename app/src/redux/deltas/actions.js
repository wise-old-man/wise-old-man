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

const fetchPlayerDeltas = (username, startDate = null, endDate = null) => async dispatch => {
  dispatch(reducers.onFetchPlayerDeltasRequest());

  try {
    const url = endpoints.fetchPlayerDeltas.replace(':username', username);
    const params = { startDate, endDate };

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchPlayerDeltasSuccess({ username, data }));
  } catch (e) {
    dispatch(reducers.onFetchPlayerDeltasError(e.message.toString()));
  }
};

const fetchGroupDeltas = (groupId, metric, period, limit, offset) => async dispatch => {
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

export { fetchPlayerDeltas, fetchGroupDeltas, fetchLeaderboards };
