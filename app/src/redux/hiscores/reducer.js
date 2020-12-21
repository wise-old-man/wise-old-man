import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetching: false,
  error: null,
  groupHiscores: {}
};

const slice = createSlice({
  name: 'hiscores',
  initialState,
  reducers: {
    onFetchRequest(state) {
      state.isFetching = true;
      state.error = null;
    },
    onFetchSuccess(state, action) {
      const { groupId, hiscores, refresh } = action.payload;

      state.isFetching = false;
      state.error = null;
      state.groupHiscores[groupId] = refresh ? hiscores : [...state.groupHiscores[groupId], ...hiscores];
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
