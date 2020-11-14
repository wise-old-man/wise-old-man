import { createSlice } from '@reduxjs/toolkit';
import { toMap } from '../utils';

const initialState = {
  isFetching: false,
  isSearching: false,
  isTracking: false,
  isAssertingType: false,
  isAssertingName: false,
  players: {},
  searchResults: {},
  updating: []
};

const slice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    onFetchRequest(state) {
      state.isFetching = true;
      state.error = null;
    },
    onFetchSuccess(state, action) {
      const { data } = action.payload;

      state.isFetching = false;
      state.error = null;
      state.players[data.username] = data;
    },
    onFetchError(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    },
    onSearchRequest(state) {
      state.isSearching = true;
      state.error = null;
    },
    onSearchSuccess(state, action) {
      const { data } = action.payload;

      state.isSearching = false;
      state.searchResults = toMap(data, 'username');
      state.players = { ...state.players, ...toMap(data, 'username') };
    },
    onSearchError(state, action) {
      state.isSearching = false;
      state.error = action.payload;
    },
    onTrackRequest(state, action) {
      state.isTracking = true;
      state.error = null;
      state.updating = [...state.updating, action.payload.username];
    },
    onTrackSuccess(state, action) {
      const { username, data } = action.payload;

      state.isTracking = false;
      state.updating = state.updating.filter(u => u !== username);
      state.players[username] = data;
    },
    onTrackError(state, action) {
      state.isTracking = false;
      state.updating = state.updating.filter(u => u !== action.payload.username);
      state.error = action.payload;
    },
    onAssertTypeRequest(state) {
      state.isAssertingType = true;
      state.error = null;
    },
    onAssertTypeSuccess(state, action) {
      const { username, playerType } = action.payload;

      state.error = null;
      state.isAssertingType = false;
      state.players[username].type = playerType;
    },
    onAssertTypeError(state, action) {
      state.isAssertingType = false;
      state.error = action.payload;
    },
    onAssertNameRequest(state) {
      state.isAssertingName = true;
      state.error = null;
    },
    onAssertNameSuccess(state, action) {
      const { username, displayName } = action.payload;

      state.error = null;
      state.isAssertingName = false;
      state.players[username].displayName = displayName;
    },
    onAssertNameError(state, action) {
      state.isAssertingName = false;
      state.error = action.payload;
    }
  }
});

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
