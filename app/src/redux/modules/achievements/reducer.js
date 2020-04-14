export const FETCH_ACHIEVEMENTS_REQUEST = 'wise-old-man/deltas/FETCH_ACHIEVEMENTS_REQUEST';
export const FETCH_ACHIEVEMENTS_SUCCESS = 'wise-old-man/deltas/FETCH_ACHIEVEMENTS_SUCCESS';
export const FETCH_ACHIEVEMENTS_FAILURE = 'wise-old-man/deltas/FETCH_ACHIEVEMENTS_FAILURE';

const initialState = {
  isFetchingAchievements: false,
  achievements: {},
};

export default function achievementsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ACHIEVEMENTS_REQUEST:
      return { ...state, isFetchingAchievements: true };

    case FETCH_ACHIEVEMENTS_SUCCESS:
      return {
        ...state,
        isFetchingAchievements: false,
        achievements: { ...state.achievements, [action.playerId]: action.achievements },
      };

    case FETCH_ACHIEVEMENTS_FAILURE:
      return { ...state, isFetchingAchievements: false, error: action.error };

    default:
      return state;
  }
}
