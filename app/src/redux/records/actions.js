import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchLeaderboards = (metric, period, type, build, country) => async dispatch => {
  dispatch(reducers.onFetchLeaderboardsRequest({ period }));

  try {
    const params = { metric, period, playerType: type, playerBuild: build, country };
    const { data } = await api.get(endpoints.fetchRecordLeaderboards, { params });

    dispatch(reducers.onFetchLeaderboardsSuccess({ period, data }));
  } catch (e) {
    dispatch(reducers.onFetchLeaderboardsError({ period, error: e.message.toString() }));
  }
};

const fetchPlayerRecords = username => async dispatch => {
  dispatch(reducers.onFetchPlayerRecordsRequest());

  try {
    const url = endpoints.fetchPlayerRecords.replace(':username', username);
    const { data } = await api.get(url);

    dispatch(reducers.onFetchPlayerRecordsSuccess({ username, data }));
  } catch (e) {
    dispatch(reducers.onFetchPlayerRecordsError(e.message.toString()));
  }
};

const fetchGroupRecords = (groupId, metric, period, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchGroupRecordsRequest());

  try {
    const params = { metric, period, limit, offset };
    const url = endpoints.fetchGroupRecords.replace(':id', groupId);

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchGroupRecordsSuccess({ groupId, data, refresh: !offset }));
  } catch (e) {
    dispatch(reducers.onFetchGroupRecordsError(e.message.toString()));
  }
};

export { fetchPlayerRecords, fetchGroupRecords, fetchLeaderboards };
