import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_COMPETITIONS_REQUEST,
  FETCH_GROUP_COMPETITIONS_SUCCESS,
  FETCH_GROUP_COMPETITIONS_FAILURE
} from '../reducer';

function fetchCompetitionsRequest() {
  return {
    type: FETCH_GROUP_COMPETITIONS_REQUEST
  };
}

function fetchCompetitionsSuccess(data, groupId) {
  return {
    type: FETCH_GROUP_COMPETITIONS_SUCCESS,
    competitions: data,
    groupId
  };
}

function fetchCompetitionsFailure(error) {
  return {
    type: FETCH_GROUP_COMPETITIONS_FAILURE,
    error
  };
}

export default function fetchCompetitions(groupId) {
  return dispatch => {
    dispatch(fetchCompetitionsRequest());

    const url = `${BASE_API_URL}/competitions/`;
    const params = { groupId };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchCompetitionsSuccess(result.data, groupId)))
      .catch(error => dispatch(fetchCompetitionsFailure(error)));
  };
}
