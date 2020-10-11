export const FETCH_LEADERBOARDS_REQUEST = 'leaderboards/FETCH_LEADERBOARDS_REQUEST';
export const FETCH_LEADERBOARDS_SUCCESS = 'leaderboards/FETCH_LEADERBOARDS_SUCCESS';
export const FETCH_LEADERBOARDS_FAILURE = 'leaderboards/FETCH_LEADERBOARDS_FAILURE';

const initialState = {
  isFetchingLeaderboards: false,
  leaderboards: []
};

export default function leaderboardsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LEADERBOARDS_REQUEST:
      return { ...state, isFetchingLeaderboards: true };

    case FETCH_LEADERBOARDS_SUCCESS: {
      return {
        ...state,
        isFetchingLeaderboards: false,
        leaderboards: action.refresh
          ? action.leaderboards
          : [...state.leaderboards, ...action.leaderboards]
      };
    }

    case FETCH_LEADERBOARDS_FAILURE:
      return { ...state, isFetchingLeaderboards: false, error: action.error };

    default:
      return state;
  }
}
