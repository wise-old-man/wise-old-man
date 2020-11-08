import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const create = (name, clanChat, members) => async dispatch => {
  dispatch(reducers.onCreateRequest());

  try {
    const body = { name, clanChat, members };
    const { data } = await api.post(endpoints.createGroup, body);

    return dispatch(reducers.onCreateSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onCreateError({ error: e.message.toString(), data: e.response.data.data }));
  }
};

const edit = (id, name, clanChat, members, verificationCode) => async dispatch => {
  dispatch(reducers.onEditRequest());

  try {
    const body = { name, clanChat, members, verificationCode };
    const url = endpoints.editGroup.replace(':id', id);

    const { data } = await api.put(url, body);

    return dispatch(reducers.onEditSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onEditError({ error: e.message.toString(), data: e.response.data.data }));
  }
};

const remove = (id, verificationCode) => async dispatch => {
  dispatch(reducers.onDeleteRequest());

  try {
    const url = endpoints.deleteGroup.replace(':id', id);
    await api.delete(url, { data: { verificationCode } });

    return dispatch(reducers.onDeleteSuccess({ groupId: id }));
  } catch (e) {
    return dispatch(reducers.onDeleteError(e.message.toString()));
  }
};

const fetchList = (name, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchListRequest());

  try {
    const params = { name, limit, offset };
    const { data } = await api.get(endpoints.fetchGroups, { params });

    const refresh = !offset;

    dispatch(reducers.onFetchListSuccess({ data, refresh }));
  } catch (e) {
    dispatch(reducers.onFetchListError(e.message.toString()));
  }
};

const fetchDetails = id => async dispatch => {
  dispatch(reducers.onFetchDetailsRequest());

  try {
    const url = endpoints.fetchGroupDetails.replace(':id', id);
    const { data } = await api.get(url);

    return dispatch(reducers.onFetchDetailsSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onFetchDetailsError(e.message.toString()));
  }
};

const fetchMembers = id => async dispatch => {
  dispatch(reducers.onFetchMembersRequest());

  try {
    const url = endpoints.fetchGroupMembers.replace(':id', id);
    const { data } = await api.get(url);

    return dispatch(reducers.onFetchMembersSuccess({ groupId: id, data }));
  } catch (e) {
    return dispatch(reducers.onFetchMembersError(e.message.toString()));
  }
};

const fetchMonthlyTop = id => async dispatch => {
  dispatch(reducers.onFetchMonthlyTopRequest());

  try {
    const url = endpoints.fetchGroupMonthlyTop.replace(':id', id);
    const { data } = await api.get(url);

    return dispatch(reducers.onFetchMonthlyTopSuccess({ groupId: id, data }));
  } catch (e) {
    return dispatch(reducers.onFetchMonthlyTopError(e.message.toString()));
  }
};

const fetchStatistics = id => async dispatch => {
  dispatch(reducers.onFetchStatisticsRequest());

  try {
    const url = endpoints.fetchGroupStatistics.replace(':id', id);
    const { data } = await api.get(url);

    return dispatch(reducers.onFetchStatisticsSuccess({ groupId: id, data }));
  } catch (e) {
    return dispatch(reducers.onFetchStatisticsError(e.message.toString()));
  }
};

const fetchPlayerGroups = username => async dispatch => {
  dispatch(reducers.onFetchPlayerGroupsRequest());

  try {
    const url = endpoints.fetchPlayerGroups.replace(':username', username);
    const { data } = await api.get(url);

    dispatch(reducers.onFetchPlayerGroupsSuccess({ data, username }));
  } catch (e) {
    dispatch(reducers.onFetchPlayerGroupsError(e.message.toString()));
  }
};

const updateAll = id => async dispatch => {
  dispatch(reducers.onUpdateAllRequest());

  try {
    const url = endpoints.updateAllMembers.replace(':id', id);

    await api.post(url);

    return dispatch(reducers.onUpdateAllSuccess());
  } catch (e) {
    return dispatch(reducers.onUpdateAllError(e.message.toString()));
  }
};

export {
  create,
  edit,
  remove,
  updateAll,
  fetchList,
  fetchDetails,
  fetchMembers,
  fetchStatistics,
  fetchMonthlyTop,
  fetchPlayerGroups
};
