import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetchingPlayerRecords: false,
  isFetchingGroupRecords: false,
  isFetchingLeaderboards: {
    '6h': false,
    day: false,
    week: false,
    month: false,
    year: false
  },
  leaderboards: {
    '6h': null,
    day: null,
    week: null,
    month: null,
    year: null
  },
  playerRecords: {},
  groupRecords: {},
  error: null
};

const slice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    onFetchLeaderboardsRequest(state, action) {
      const { period } = action.payload;

      state.isFetchingLeaderboards[period] = true;
      state.error = null;
    },
    onFetchLeaderboardsSuccess(state, action) {
      const { period, data } = action.payload;

      state.isFetchingLeaderboards[period] = false;
      state.leaderboards[period] = data;
      state.error = null;
    },
    onFetchLeaderboardsError(state, action) {
      const { period, error } = action;

      state.isFetchingLeaderboards[period] = false;
      state.error = error;
    },
    onFetchPlayerRecordsRequest(state) {
      state.isFetchingPlayerRecords = true;
      state.error = null;
    },
    onFetchPlayerRecordsSuccess(state, action) {
      const { username, data } = action.payload;

      state.error = null;
      state.isFetchingPlayerRecords = false;
      state.playerRecords[username] = data;
    },
    onFetchPlayerRecordsError(state, action) {
      state.isFetchingPlayerRecords = false;
      state.error = action.payload;
    },
    onFetchGroupRecordsRequest(state) {
      state.isFetchingGroupRecords = true;
      state.error = null;
    },
    onFetchGroupRecordsSuccess(state, action) {
      const { groupId, data, refresh } = action.payload;

      state.error = null;
      state.isFetchingGroupRecords = false;
      state.groupRecords[groupId] = refresh ? data : [...state.groupRecords[groupId], ...data];
    },
    onFetchGroupRecordsError(state, action) {
      state.isFetchingGroupRecords = false;
      state.error = action.payload;
    }
  }
});

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
