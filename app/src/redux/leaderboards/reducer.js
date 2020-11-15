import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetching: false,
  error: null,
  leaderboards: []
};

const slice = createSlice({
  name: 'leaderboards',
  initialState,
  reducers: {
    onFetchRequest(state) {
      state.isFetching = true;
      state.error = null;
    },
    onFetchSuccess(state, action) {
      const { refresh, data } = action.payload;

      state.isFetching = false;
      state.error = null;
      state.leaderboards = refresh ? data : [...state.leaderboards, ...data];
    },
    onFetchError(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    }
  }
});

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
