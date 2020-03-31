export const FETCH_LEADERBOARD_REQUEST = 'wise-old-man/deltas/FETCH_REQUEST';
export const FETCH_LEADERBOARD_SUCCESS = 'wise-old-man/deltas/FETCH_SUCCESS';
export const FETCH_LEADERBOARD_FAILURE = 'wise-old-man/deltas/FETCH_FAILURE';

export const FETCH_PLAYER_DELTAS_REQUEST = 'wise-old-man/deltas/FETCH_PLAYER_DELTAS_REQUEST';
export const FETCH_PLAYER_DELTAS_SUCCESS = 'wise-old-man/deltas/FETCH_PLAYER_DELTAS_SUCCESS';
export const FETCH_PLAYER_DELTAS_FAILURE = 'wise-old-man/deltas/FETCH_PLAYER_DELTAS_FAILURE';

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
