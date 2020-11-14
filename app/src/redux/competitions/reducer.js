import { createSlice } from '@reduxjs/toolkit';
import { omit, mapValues } from 'lodash';
import { toMap } from '../utils';

const initialState = {
  isCreating: false,
  isDeleting: false,
  isEditing: false,
  isFetchingList: false,
  isFetchingDetails: false,
  competitions: {},
  playerCompetitions: {},
  groupCompetitions: {},
  error: { message: null, data: null }
};

const slice = createSlice({
  name: 'competitions',
  initialState,
  reducers: {
    onParticipantUpdated(state, action) {
      state.competitions = playerUpdated(state.competitions, action.payload.username);
    },
    onFetchListRequest(state) {
      state.isFetchingList = true;
      state.error = initialState.error;
    },
    onFetchListSuccess(state, action) {
      const { refresh, data } = action.payload;

      state.isFetchingList = false;
      state.error = initialState.error;
      state.competitions = refresh ? toMap(data, 'id') : { ...state.competitions, ...toMap(data, 'id') };
    },
    onFetchListError(state, action) {
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
      state.competitions = replaceDetails(state.competitions, data);
    },
    onFetchDetailsError(state, action) {
      state.isFetchingDetails = false;
      state.error = { message: action.payload.error };
    },
    onFetchPlayerCompetitionsRequest(state) {
      state.isFetchingList = true;
      state.error = initialState.error;
    },
    onFetchPlayerCompetitionsSuccess(state, action) {
      const { username, data } = action.payload;

      state.isFetchingList = false;
      state.error = initialState.error;
      state.competitions = toMap(data, 'id');
      state.playerCompetitions[username] = data;
    },
    onFetchPlayerCompetitionsError(state, action) {
      state.isFetchingList = false;
      state.error = { message: action.payload.error };
    },
    onFetchGroupCompetitionsRequest(state) {
      state.isFetchingList = true;
      state.error = initialState.error;
    },
    onFetchGroupCompetitionsSuccess(state, action) {
      const { groupId, data } = action.payload;

      state.isFetchingList = false;
      state.error = initialState.error;
      state.competitions = toMap(data, 'id');
      state.groupCompetitions[groupId] = data;
    },
    onFetchGroupCompetitionsError(state, action) {
      state.isFetchingList = false;
      state.error = { message: action.payload.error };
    },
    onCreateRequest(state) {
      state.isCreating = true;
    },
    onCreateSuccess(state, action) {
      const { data } = action.payload;

      state.isCreating = false;
      state.competitions = replaceDetails(state.competitions, data);
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
      state.competitions = replaceDetails(state.competitions, data);
    },
    onEditError(state, action) {
      const { error, data } = action.payload;

      state.isEditing = false;
      state.error = { message: error, data };
    },
    onDeleteRequest(state) {
      state.isDeleting = true;
    },
    onDeleteSuccess(state, action) {
      const { competitionId } = action.payload;

      state.isDeleting = false;
      state.competitions = omit(state.competitions, competitionId);
    },
    onDeleteError(state, action) {
      state.isDeleting = false;
      state.error = { message: action.payload.error };
    },
    onUpdateAllRequest() {},
    onUpdateAllSuccess() {},
    onUpdateAllError(state, action) {
      state.error = { message: action.payload.error };
    }
  }
});

function replaceDetails(competitions, details) {
  // If competition is not in the list, simply add it
  if (!competitions[details.id]) {
    return { ...competitions, [details.id]: details };
  }

  // If it already exists in the list, add the new key:value pairs to it
  return { ...competitions, [details.id]: { ...competitions[details.id], ...details } };
}

function playerUpdated(competitions, username) {
  const newCompetitions = mapValues(competitions, c => {
    if (!c.participants) {
      return c;
    }

    return {
      ...c,
      participants: c.participants.map(p => ({
        ...p,
        updatedAt: p.username === username ? new Date() : p.updatedAt
      }))
    };
  });

  return newCompetitions;
}

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
