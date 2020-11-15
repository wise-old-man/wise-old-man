import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetchingPlayerAchievements: false,
  isFetchingGroupAchievements: false,
  playerAchievements: {},
  groupAchievements: {},
  error: null
};

const slice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    onFetchPlayerAchievementsRequest(state) {
      state.isFetchingPlayerAchievements = true;
      state.error = null;
    },
    onFetchPlayerAchievementsSuccess(state, action) {
      const { username, data } = action.payload;

      state.error = null;
      state.isFetchingPlayerAchievements = false;
      state.playerAchievements[username] = data;
    },
    onFetchPlayerAchievementsError(state, action) {
      state.isFetchingPlayerAchievements = false;
      state.error = action.payload;
    },
    onFetchGroupAchievementsRequest(state) {
      state.isFetchingGroupAchievements = true;
      state.error = null;
    },
    onFetchGroupAchievementsSuccess(state, action) {
      const { groupId, data } = action.payload;

      state.error = null;
      state.isFetchingGroupAchievements = false;
      state.groupAchievements[groupId] = data;
    },
    onFetchGroupAchievementsError(state, action) {
      state.isFetchingGroupAchievements = false;
      state.error = action.payload;
    }
  }
});

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
