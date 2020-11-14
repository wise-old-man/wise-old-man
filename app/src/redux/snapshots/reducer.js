import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetching: false,
  error: null,
  snapshots: {}
};

const slice = createSlice({
  name: 'snapshots',
  initialState,
  reducers: {
    onFetchRequest(state) {
      state.isFetching = true;
      state.error = null;
    },
    onFetchSuccess(state, action) {
      const { username, period, data } = action.payload;

      state.isFetching = false;
      state.error = null;
      state.snapshots[username] = { ...state.snapshots[username], [period]: data };
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
