export const FETCH_PLAYER_ACHIEVEMENTS_REQUEST = 'achievements/FETCH_PLAYER_ACHIEVEMENTS_REQUEST';
export const FETCH_PLAYER_ACHIEVEMENTS_SUCCESS = 'achievements/FETCH_PLAYER_ACHIEVEMENTS_SUCCESS';
export const FETCH_PLAYER_ACHIEVEMENTS_FAILURE = 'achievements/FETCH_PLAYER_ACHIEVEMENTS_FAILURE';

export const FETCH_GROUP_ACHIEVEMENTS_REQUEST = 'achievements/FETCH_GROUP_ACHIEVEMENTS_REQUEST';
export const FETCH_GROUP_ACHIEVEMENTS_SUCCESS = 'achievements/FETCH_GROUP_ACHIEVEMENTS_SUCCESS';
export const FETCH_GROUP_ACHIEVEMENTS_FAILURE = 'achievements/FETCH_GROUP_ACHIEVEMENTS_FAILURE';

const initialState = {
  isFetchingPlayerAchievements: false,
  isFetchingGroupAchievements: false,
  playerAchievements: {},
  groupAchievements: {}
};

export default function achievementsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_PLAYER_ACHIEVEMENTS_REQUEST:
      return { ...state, isFetchingPlayerAchievements: true };

    case FETCH_PLAYER_ACHIEVEMENTS_SUCCESS:
      return {
        ...state,
        isFetchingPlayerAchievements: false,
        playerAchievements: { ...state.playerAchievements, [action.username]: action.achievements }
      };

    case FETCH_PLAYER_ACHIEVEMENTS_FAILURE:
      return { ...state, isFetchingPlayerAchievements: false, error: action.error };

    case FETCH_GROUP_ACHIEVEMENTS_REQUEST:
      return { ...state, isFetchingGroupAchievements: true };

    case FETCH_GROUP_ACHIEVEMENTS_SUCCESS:
      return {
        ...state,
        isFetchingGroupAchievements: false,
        groupAchievements: { ...state.groupAchievements, [action.groupId]: action.achievements }
      };

    case FETCH_GROUP_ACHIEVEMENTS_FAILURE:
      return { ...state, isFetchingGroupAchievements: false, error: action.error };

    default:
      return state;
  }
}
