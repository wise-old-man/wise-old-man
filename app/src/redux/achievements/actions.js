import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchPlayerAchievements = username => async dispatch => {
  dispatch(reducers.onFetchPlayerAchievementsRequest());

  try {
    const params = { includeMissing: true };
    const url = endpoints.fetchPlayerAchievements.replace(':username', username);

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchPlayerAchievementsSuccess({ username, data }));
  } catch (e) {
    dispatch(reducers.onFetchPlayerAchievementsError(e.message.toString()));
  }
};

const fetchGroupAchievements = groupId => async dispatch => {
  dispatch(reducers.onFetchGroupAchievementsRequest());

  try {
    const url = endpoints.fetchGroupAchievements.replace(':groupId', groupId);
    const { data } = await api.get(url);

    dispatch(reducers.onFetchGroupAchievementsSuccess({ groupId, data }));
  } catch (e) {
    dispatch(reducers.onFetchGroupAchievementsError(e.message.toString()));
  }
};

export { fetchPlayerAchievements, fetchGroupAchievements };
