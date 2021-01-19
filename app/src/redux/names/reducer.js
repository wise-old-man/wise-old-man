import { createSlice } from '@reduxjs/toolkit';
import { toMap } from '../utils';

const initialState = {
  isFetching: false,
  isSubmitting: false,
  error: { message: null, data: null },
  nameChanges: {},
  playerNameChanges: {},
  groupNameChanges: {}
};

const slice = createSlice({
  name: 'names',
  initialState,
  reducers: {
    onFetchRequest(state) {
      state.isFetching = true;
      state.error = initialState.error;
    },
    onFetchSuccess(state, action) {
      const { refresh, data } = action.payload;

      state.isFetching = false;
      state.error = initialState.error;
      state.nameChanges = refresh ? toMap(data, 'id') : { ...state.nameChanges, ...toMap(data, 'id') };
    },
    onFetchError(state, action) {
      state.isFetching = false;
      state.error = { message: action.error };
    },
    onSubmitRequest(state) {
      state.isSubmitting = true;
      state.error = initialState.error;
    },
    onSubmitSuccess(state, action) {
      const { data } = action.payload;

      state.isSubmitting = false;
      state.error = initialState.error;
      state.nameChanges[data.id] = data;
    },
    onSubmitError(state, action) {
      state.isSubmitting = false;
      state.error = { message: action.error, data: action.data };
    },
    onFetchPlayerNameChangesRequest(state) {
      state.isFetchingList = true;
      state.error = initialState.error;
    },
    onFetchPlayerNameChangesSuccess(state, action) {
      const { username, data } = action.payload;

      state.isFetchingList = false;
      state.error = initialState.error;
      state.playerNameChanges[username] = data;
    },
    onFetchPlayerNameChangesError(state, action) {
      state.isFetchingList = false;
      state.error = { message: action.payload.error };
    },
    onFetchGroupNameChangesRequest(state) {
      state.isFetchingList = true;
      state.error = initialState.error;
    },
    onFetchGroupNameChangesSuccess(state, action) {
      const { groupId, data, refresh } = action.payload;

      state.isFetchingList = false;
      state.error = initialState.error;
      state.groupNameChanges[groupId] = refresh ? data : [...state.groupNameChanges[groupId], ...data];
    },
    onFetchGroupNameChangesError(state, action) {
      state.isFetchingList = false;
      state.error = { message: action.payload.error };
    }
  }
});

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
