import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import { ASSERT_TYPE_REQUEST, ASSERT_TYPE_SUCCESS, ASSERT_TYPE_FAILURE } from '../reducer';

function assertTypeRequest() {
  return {
    type: ASSERT_TYPE_REQUEST
  };
}

function assertTypeSuccess(data, username, playerId) {
  Analytics.event({
    category: 'Player',
    action: 'Asserted player type',
    value: username
  });

  return {
    type: ASSERT_TYPE_SUCCESS,
    playerId,
    playerType: data.type
  };
}

function assertTypeFailure(error) {
  return {
    type: ASSERT_TYPE_FAILURE,
    error: error.response.data.message
  };
}

export default function assertType(username, playerId) {
  return dispatch => {
    dispatch(assertTypeRequest(username));

    const url = `${BASE_API_URL}/players/assert-type/`;
    const body = { username };

    return axios
      .post(url, body)
      .then(result => dispatch(assertTypeSuccess(result.data, username, playerId)))
      .catch(error => dispatch(assertTypeFailure(error, username)));
  };
}
