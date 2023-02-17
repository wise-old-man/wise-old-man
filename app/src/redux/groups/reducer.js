import { createSlice } from '@reduxjs/toolkit';
import { toMap } from '../utils';

const initialState = {
  isCreating: false,
  isEditing: false,
  isDeleting: false,
  isFetchingList: false,
  isFetchingDetails: false,
  isFetchingMonthlyTop: false,
  isFetchingStatistics: false,
  isFetchingPlayerGroups: false,
  groups: {},
  playerGroups: {},
  error: { message: null, data: null }
};

const slice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    onFetchListRequest(state) {
      state.isFetchingList = true;
      state.error = initialState.error;
    },
    onFetchListSuccess(state, action) {
      const { refresh, data } = action.payload;

      state.isFetchingList = false;
      state.error = initialState.error;
      state.groups = refresh ? toMap(data, 'id') : { ...state.groups, ...toMap(data, 'id') };
    },
    onFetchListError(state, action) {
      state.isFetchingList = false;
      state.error = { message: action.payload.error };
    },
    onFetchPlayerGroupsRequest(state) {
      state.isFetchingList = true;
      state.error = initialState.error;
    },
    onFetchPlayerGroupsSuccess(state, action) {
      const { username, data } = action.payload;

      state.isFetchingList = false;
      state.error = initialState.error;
      state.groups = toMap(data, 'id');
      state.playerGroups[username] = data;
    },
    onFetchPlayerGroupsError(state, action) {
      state.isFetchingList = false;
      state.error = { message: action.payload.error };
    },
    onFetchDetailsRequest(state) {
      state.isFetchingDetails = true;
      state.error = initialState.error;
    },
    onFetchDetailsSuccess(state, action) {
      const { data } = action.payload;

      state.isFetchingDetails = false;
      state.error = initialState.error;
      state.groups = replaceDetails(state.groups, data);
    },
    onFetchDetailsError(state, action) {
      state.isFetchingDetails = false;
      state.error = { message: action.payload.error };
    },
    onFetchMonthlyTopRequest(state) {
      state.isFetchingMonthlyTop = true;
      state.error = initialState.error;
    },
    onFetchMonthlyTopSuccess(state, action) {
      const { groupId, data } = action.payload;

      state.isFetchingMonthlyTop = false;
      state.error = initialState.error;
      state.groups[groupId] = { ...state.groups[groupId], monthlyTopPlayer: data };
    },
    onFetchMonthlyTopError(state, action) {
      state.isFetchingMonthlyTop = false;
      state.error = { message: action.payload.error };
    },
    onFetchStatisticsRequest(state) {
      state.isFetchingStatistics = true;
      state.error = initialState.error;
    },
    onFetchStatisticsSuccess(state, action) {
      const { groupId, data } = action.payload;

      state.isFetchingStatistics = false;
      state.error = initialState.error;
      state.groups[groupId] = { ...state.groups[groupId], statistics: data };
    },
    onFetchStatisticsError(state, action) {
      state.isFetchingStatistics = false;
      state.error = { message: action.payload.error };
    },
    onCreateRequest(state) {
      state.isCreating = true;
    },
    onCreateSuccess(state, action) {
      const { data } = action.payload;

      state.isCreating = false;
      state.groups = replaceDetails(state.groups, data.group);
    },
    onCreateError(state, action) {
      const { error, data } = action.payload;

      state.isCreating = false;
      state.error = { message: error, data };
    },
    onEditRequest(state) {
      state.isEditing = true;
    },
    onEditSuccess(state, action) {
      const { data } = action.payload;

      state.isEditing = false;
      state.groups = replaceDetails(state.groups, data);
    },
    onEditError(state, action) {
      const { error, data } = action.payload;

      state.isEditing = false;
      state.error = { message: error, data };
    },
    onDeleteRequest(state) {
      state.isDeleting = true;
    },
    onDeleteSuccess(state) {
      state.isDeleting = false;
    },
    onDeleteError(state, action) {
      state.isDeleting = false;
      state.error = { message: action.payload.error };
    },
    onUpdateAllRequest() {},
    onUpdateAllSuccess() {},
    onUpdateAllError(state, action) {
      state.error = { message: action.payload.error };
    },
    onMigrateRequest() {},
    onMigrateSuccess() {},
    onMigrateError(state, action) {
      state.error = { message: action.payload.error };
    }
  }
});

function replaceDetails(groups, details) {
  // If group is not in the list, simply add it
  if (!groups[details.id]) {
    return { ...groups, [details.id]: details };
  }

  // If it already exists in the list, add the new key:value pairs to it
  return { ...groups, [details.id]: { ...groups[details.id], ...details } };
}

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
