import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchLeaderboards = (metric, period, type, build) => async dispatch => {
  dispatch(reducers.onFetchLeaderboardsRequest({ period }));

  try {
    const params = { metric, period, playerType: type, playerBuild: build };
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

const fetchGroupRecords = (groupId, metric, period) => async dispatch => {
  dispatch(reducers.onFetchGroupRecordsRequest());

  try {
    const params = { metric, period };
    const url = endpoints.fetchGroupRecords.replace(':groupId', groupId);

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchGroupRecordsSuccess({ groupId, data }));
  } catch (e) {
    dispatch(reducers.onFetchGroupRecordsError(e.message.toString()));
  }
};

export { fetchPlayerRecords, fetchGroupRecords, fetchLeaderboards };
