import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const create = (name, description, clanChat, homeworld, members) => async dispatch => {
  dispatch(reducers.onCreateRequest());

  try {
    const body = { name, description, clanChat, homeworld, members };
    const { data } = await api.post(endpoints.createGroup, body);

    return dispatch(reducers.onCreateSuccess({ data }));
  } catch (e) {
    const { message, data } = e.response.data;
    return dispatch(reducers.onCreateError({ error: message, data }));
  }
};

const edit = (
  id,
  name,
  description,
  clanChat,
  homeworld,
  members,
  verificationCode
) => async dispatch => {
  dispatch(reducers.onEditRequest());

  try {
    const body = { name, description, clanChat, homeworld, members, verificationCode };
    const url = endpoints.editGroup.replace(':id', id);

    const { data } = await api.put(url, body);

    return dispatch(reducers.onEditSuccess({ data }));
  } catch (e) {
    const { message, data } = e.response.data;
    return dispatch(reducers.onEditError({ error: message, data }));
  }
};

const remove = (id, verificationCode) => async dispatch => {
  dispatch(reducers.onDeleteRequest());

  try {
    const url = endpoints.deleteGroup.replace(':id', id);
    await api.delete(url, { data: { verificationCode } });

    return dispatch(reducers.onDeleteSuccess({ groupId: id }));
  } catch (e) {
    return dispatch(reducers.onDeleteError({ error: e.response.data.message }));
  }
};

const fetchList = (query, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchListRequest());

  try {
    const params = { ...query, limit, offset };
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

const updateAll = (id, verificationCode) => async dispatch => {
  dispatch(reducers.onUpdateAllRequest());

  try {
    const url = endpoints.updateAllMembers.replace(':id', id);
    const { data } = await api.post(url, { verificationCode });

    return dispatch(reducers.onUpdateAllSuccess({ groupId: id, data }));
  } catch (e) {
    const { message, data } = e.response.data;
    return dispatch(reducers.onUpdateAllError({ error: message, data }));
  }
};

const fetchTempleMembers = templeId => async dispatch => {
  dispatch(reducers.onMigrateRequest());

  try {
    const url = endpoints.migrateFromTemple.replace(':id', templeId);
    const { data } = await api.get(url);

    return dispatch(reducers.onMigrateSuccess({ templeId, data }));
  } catch (e) {
    const { message, data } = e.response.data;
    return dispatch(reducers.onMigrateError({ error: message, data }));
  }
};

const fetchCMLMembers = cmlId => async dispatch => {
  dispatch(reducers.onMigrateRequest());

  try {
    const url = endpoints.migrateFromCML.replace(':id', cmlId);
    const { data } = await api.get(url);

    return dispatch(reducers.onMigrateSuccess({ cmlId, data }));
  } catch (e) {
    const { message, data } = e.response.data;
    return dispatch(reducers.onMigrateError({ error: message, data }));
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
  fetchPlayerGroups,
  fetchTempleMembers,
  fetchCMLMembers
};
