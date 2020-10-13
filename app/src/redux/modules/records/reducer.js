export const FETCH_LEADERBOARD_REQUEST = 'records/FETCH_RECORDS_LEADERBOARD_REQUEST';
export const FETCH_LEADERBOARD_SUCCESS = 'records/FETCH_RECORDS_LEADERBOARD_SUCCESS';
export const FETCH_LEADERBOARD_FAILURE = 'records/FETCH_RECORDS_LEADERBOARD_FAILURE';

export const FETCH_PLAYER_RECORDS_REQUEST = 'records/FETCH_PLAYER_RECORDS_REQUEST';
export const FETCH_PLAYER_RECORDS_SUCCESS = 'records/FETCH_PLAYER_RECORDS_SUCCESS';
export const FETCH_PLAYER_RECORDS_FAILURE = 'records/FETCH_PLAYER_RECORDS_FAILURE';

export const FETCH_GROUP_RECORDS_REQUEST = 'records/FETCH_GROUP_RECORDS_REQUEST';
export const FETCH_GROUP_RECORDS_SUCCESS = 'records/FETCH_GROUP_RECORDS_SUCCESS';
export const FETCH_GROUP_RECORDS_FAILURE = 'records/FETCH_GROUP_RECORDS_FAILURE';

const initialState = {
  isFetching: {
    day: false,
    week: false,
    month: false
  },
  leaderboards: {
    day: null,
    week: null,
    month: null
  },
  isFetchingPlayerRecords: false,
  isFetchingGroupRecords: false,
  playerRecords: {},
  groupRecords: {}
};

export default function recordsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LEADERBOARD_REQUEST:
      return { ...state, isFetching: { ...state.isFetching, [action.period]: true } };

    case FETCH_LEADERBOARD_SUCCESS: {
      return {
        ...state,
        isFetching: { ...state.isFetching, [action.period]: false },
        leaderboards: { ...state.leaderboards, [action.period]: action.leaderboard }
      };
    }

    case FETCH_LEADERBOARD_FAILURE:
      return {
        ...state,
        isFetching: { ...state.isFetching, [action.period]: false },
        error: action.error
      };

    case FETCH_PLAYER_RECORDS_REQUEST:
      return { ...state, isFetchingPlayerRecords: true };

    case FETCH_PLAYER_RECORDS_SUCCESS:
      return {
        ...state,
        isFetchingPlayerRecords: false,
        playerRecords: { ...state.playerRecords, [action.username]: action.records }
      };

    case FETCH_PLAYER_RECORDS_FAILURE:
      return { ...state, isFetchingPlayerRecords: false, error: action.error };

    case FETCH_GROUP_RECORDS_REQUEST:
      return { ...state, isFetchingGroupRecords: true };

    case FETCH_GROUP_RECORDS_SUCCESS:
      return {
        ...state,
        isFetchingGroupRecords: false,
        groupRecords: { ...state.groupRecords, [action.groupId]: action.records }
      };

    case FETCH_GROUP_RECORDS_FAILURE:
      return { ...state, isFetchingGroupRecords: false, error: action.error };

    default:
      return state;
  }
}
