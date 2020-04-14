export const FETCH_LEADERBOARD_REQUEST = 'wise-old-man/records/FETCH_LEADERBOARD_REQUEST';
export const FETCH_LEADERBOARD_SUCCESS = 'wise-old-man/records/FETCH_LEADERBOARD_SUCCESS';
export const FETCH_LEADERBOARD_FAILURE = 'wise-old-man/records/FETCH_LEADERBOARD_FAILURE';

export const FETCH_PLAYER_RECORDS_REQUEST = 'wise-old-man/records/FETCH_PLAYER_RECORDS_REQUEST';
export const FETCH_PLAYER_RECORDS_SUCCESS = 'wise-old-man/records/FETCH_PLAYER_RECORDS_SUCCESS';
export const FETCH_PLAYER_RECORDS_FAILURE = 'wise-old-man/records/FETCH_PLAYER_RECORDS_FAILURE';

const initialState = {
  isFetchingLeaderboard: false,
  isFetchingPlayerRecords: false,
  records: {},
  leaderboard: {},
};

export default function recordsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LEADERBOARD_REQUEST:
      return { ...state, isFetchingLeaderboard: true };

    case FETCH_LEADERBOARD_SUCCESS:
      return { ...state, isFetchingLeaderboard: false, leaderboard: action.leaderboard };

    case FETCH_LEADERBOARD_FAILURE:
      return { ...state, isFetchingLeaderboard: false, error: action.error };

    case FETCH_PLAYER_RECORDS_REQUEST:
      return { ...state, isFetchingPlayerRecords: true };

    case FETCH_PLAYER_RECORDS_SUCCESS:
      return {
        ...state,
        isFetchingPlayerRecords: false,
        records: { ...state.records, [action.playerId]: action.records },
      };

    case FETCH_PLAYER_RECORDS_FAILURE:
      return { ...state, isFetchingPlayerRecords: false, error: action.error };

    default:
      return state;
  }
}
