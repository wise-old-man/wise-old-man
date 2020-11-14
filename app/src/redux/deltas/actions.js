import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchLeaderboards = (metric, period, type, build) => async dispatch => {
  dispatch(reducers.onFetchLeaderboardsRequest({ period }));

  try {
    const params = { metric, period, playerType: type, playerBuild: build };
    const { data } = await api.get(endpoints.fetchDeltasLeaderboards, { params });

    dispatch(reducers.onFetchLeaderboardsSuccess({ period, data }));
  } catch (e) {
    dispatch(reducers.onFetchLeaderboardsError({ period, error: e.message.toString() }));
  }
};

const fetchPlayerDeltas = username => async dispatch => {
  dispatch(reducers.onFetchPlayerDeltasRequest());

  try {
    const url = endpoints.fetchPlayerDeltas.replace(':username', username);
    const { data } = await api.get(url);

    dispatch(reducers.onFetchPlayerDeltasSuccess({ username, data }));
  } catch (e) {
    dispatch(reducers.onFetchPlayerDeltasError(e.message.toString()));
  }
};

const fetchGroupDeltas = (groupId, metric, period) => async dispatch => {
  dispatch(reducers.onFetchGroupDeltasRequest());

  try {
    const params = { metric, period };
    const url = endpoints.fetchGroupDeltas.replace(':id', groupId);

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchGroupDeltasSuccess({ groupId, data }));
  } catch (e) {
    dispatch(reducers.onFetchGroupDeltasError(e.message.toString()));
  }
};

export { fetchPlayerDeltas, fetchGroupDeltas, fetchLeaderboards };
