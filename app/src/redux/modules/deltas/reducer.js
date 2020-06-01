export const FETCH_LEADERBOARD_REQUEST = 'deltas/FETCH_DELTAS_LEADERBOARDS_REQUEST';
export const FETCH_LEADERBOARD_SUCCESS = 'deltas/FETCH_DELTAS_LEADERBOARDS_SUCCESS';
export const FETCH_LEADERBOARD_FAILURE = 'deltas/FETCH_DELTAS_LEADERBOARDS_FAILURE';

export const FETCH_PLAYER_DELTAS_REQUEST = 'deltas/FETCH_PLAYER_DELTAS_REQUEST';
export const FETCH_PLAYER_DELTAS_SUCCESS = 'deltas/FETCH_PLAYER_DELTAS_SUCCESS';
export const FETCH_PLAYER_DELTAS_FAILURE = 'deltas/FETCH_PLAYER_DELTAS_FAILURE';

const initialState = {
  isFetchingLeaderboard: false,
  isFetchingPlayerDeltas: false,
  deltas: {},
  leaderboard: {}
};

export default function deltasReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LEADERBOARD_REQUEST:
      return { ...state, isFetchingLeaderboard: true };

    case FETCH_LEADERBOARD_SUCCESS:
      return { ...state, isFetchingLeaderboard: false, leaderboard: action.leaderboard };

    case FETCH_LEADERBOARD_FAILURE:
      return { ...state, isFetchingLeaderboard: false, error: action.error };

    case FETCH_PLAYER_DELTAS_REQUEST:
      return { ...state, isFetchingPlayerDeltas: true };

    case FETCH_PLAYER_DELTAS_SUCCESS:
      return {
        ...state,
        isFetchingPlayerDeltas: false,
        deltas: { ...state.deltas, [action.playerId]: action.deltas }
      };

    case FETCH_PLAYER_DELTAS_FAILURE:
      return { ...state, isFetchingPlayerDeltas: false, error: action.error };

    default:
      return state;
  }
}
