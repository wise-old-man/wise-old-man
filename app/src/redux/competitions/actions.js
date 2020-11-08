import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const create = (
  title,
  metric,
  startsAt,
  endsAt,
  participants,
  groupVerificationCode,
  groupId
) => async dispatch => {
  dispatch(reducers.onCreateRequest());

  try {
    const body = { title, metric, startsAt, endsAt, participants, groupVerificationCode, groupId };
    const { data } = await api.post(endpoints.createCompetition, body);
    console.log(data);

    return dispatch(reducers.onCreateSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onCreateError({ error: e.message.toString(), data: e.response.data.data }));
  }
};

const edit = (id, title, metric, startsAt, endsAt, participants, verificationCode) => async dispatch => {
  dispatch(reducers.onEditRequest());

  try {
    const body = { title, metric, startsAt, endsAt, participants, verificationCode };
    const url = endpoints.editCompetition.replace(':id', id);

    const { data } = await api.put(url, body);

    return dispatch(reducers.onEditSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onEditError({ error: e.message.toString(), data: e.response.data.data }));
  }
};

const remove = (id, verificationCode) => async dispatch => {
  dispatch(reducers.onDeleteRequest());

  try {
    const url = endpoints.deleteCompetition.replace(':id', id);
    await api.delete(url, { data: { verificationCode } });

    return dispatch(reducers.onDeleteSuccess({ competitionId: id }));
  } catch (e) {
    return dispatch(reducers.onDeleteError(e.message.toString()));
  }
};

const fetchList = (title, metric, status, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchListRequest());

  try {
    const params = { title, metric, status, limit, offset };
    const { data } = await api.get(endpoints.fetchCompetitions, { params });

    const refresh = !offset;

    dispatch(reducers.onFetchListSuccess({ data, refresh }));
  } catch (e) {
    dispatch(reducers.onFetchListError(e.message.toString()));
  }
};

const fetchDetails = id => async dispatch => {
  dispatch(reducers.onFetchDetailsRequest());

  try {
    const url = endpoints.fetchCompetitionDetails.replace(':id', id);
    const { data } = await api.get(url);

    return dispatch(reducers.onFetchDetailsSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onFetchDetailsError(e.message.toString()));
  }
};

const fetchGroupCompetitions = groupId => async dispatch => {
  dispatch(reducers.onFetchGroupCompetitionsRequest());

  try {
    const url = endpoints.fetchGroupCompetitions.replace(':groupId', groupId);
    const { data } = await api.get(url);

    dispatch(reducers.onFetchGroupCompetitionsSuccess({ data, groupId }));
  } catch (e) {
    dispatch(reducers.onFetchGroupCompetitionsError(e.message.toString()));
  }
};

const fetchPlayerCompetitions = username => async dispatch => {
  dispatch(reducers.onFetchPlayerCompetitionsRequest());

  try {
    const url = endpoints.fetchPlayerCompetitions.replace(':username', username);
    const { data } = await api.get(url);

    dispatch(reducers.onFetchPlayerCompetitionsSuccess({ data, username }));
  } catch (e) {
    dispatch(reducers.onFetchPlayerCompetitionsError(e.message.toString()));
  }
};

const updateAll = id => async dispatch => {
  dispatch(reducers.onUpdateAllRequest());

  try {
    const url = endpoints.updateAllParticipants.replace(':id', id);

    await api.post(url);

    return dispatch(reducers.onDeleteSuccess());
  } catch (e) {
    return dispatch(reducers.onDeleteError(e.message.toString()));
  }
};

export {
  create,
  edit,
  remove,
  updateAll,
  fetchList,
  fetchDetails,
  fetchGroupCompetitions,
  fetchPlayerCompetitions
};
