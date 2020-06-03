import _ from 'lodash';
import { toMap } from '../../utils';

export const CREATE_GROUP_REQUEST = 'groups/CREATE_GROUP_REQUEST';
export const CREATE_GROUP_SUCCESS = 'groups/CREATE_GROUP_SUCCESS';
export const CREATE_GROUP_FAILURE = 'groups/CREATE_GROUP_FAILURE';

export const EDIT_GROUP_REQUEST = 'groups/EDIT_GROUP_REQUEST';
export const EDIT_GROUP_SUCCESS = 'groups/EDIT_GROUP_SUCCESS';
export const EDIT_GROUP_FAILURE = 'groups/EDIT_GROUP_FAILURE';

export const DELETE_GROUP_REQUEST = 'groups/DELETE_GROUP_REQUEST';
export const DELETE_GROUP_SUCCESS = 'groups/DELETE_GROUP_SUCCESS';
export const DELETE_GROUP_FAILURE = 'groups/DELETE_GROUP_FAILURE';

export const FETCH_GROUPS_REQUEST = 'groups/FETCH_GROUP_LIST_REQUEST';
export const FETCH_GROUPS_SUCCESS = 'groups/FETCH_GROUP_LIST_SUCCESS';
export const FETCH_GROUPS_FAILURE = 'groups/FETCH_GROUP_LIST_FAILURE';

export const FETCH_GROUP_REQUEST = 'groups/FETCH_GROUP_REQUEST';
export const FETCH_GROUP_SUCCESS = 'groups/FETCH_GROUP_SUCCESS';
export const FETCH_GROUP_FAILURE = 'groups/FETCH_GROUP_FAILURE';

export const FETCH_GROUP_MEMBERS_REQUEST = 'groups/FETCH_GROUP_MEMBERS_REQUEST';
export const FETCH_GROUP_MEMBERS_SUCCESS = 'groups/FETCH_GROUP_MEMBERS_SUCCESS';
export const FETCH_GROUP_MEMBERS_FAILURE = 'groups/FETCH_GROUP_MEMBERS_FAILURE';

export const FETCH_GROUP_MONTHLY_TOP_REQUEST = 'groups/FETCH_GROUP_MONTHLY_TOP_REQUEST';
export const FETCH_GROUP_MONTHLY_TOP_SUCCESS = 'groups/FETCH_GROUP_MONTHLY_TOP_SUCCESS';
export const FETCH_GROUP_MONTHLY_TOP_FAILURE = 'groups/FETCH_GROUP_MONTHLY_TOP_FAILURE';

export const FETCH_GROUP_STATISTICS_REQUEST = 'groups/FETCH_GROUP_STATISTICS_REQUEST';
export const FETCH_GROUP_STATISTICS_SUCCESS = 'groups/FETCH_GROUP_STATISTICS_SUCCESS';
export const FETCH_GROUP_STATISTICS_FAILURE = 'groups/FETCH_GROUP_STATISTICS_FAILURE';

export const FETCH_PLAYER_GROUPS_REQUEST = 'groups/FETCH_PLAYER_GROUPS_REQUEST';
export const FETCH_PLAYER_GROUPS_SUCCESS = 'groups/FETCH_PLAYER_GROUPS_SUCCESS';
export const FETCH_PLAYER_GROUPS_FAILURE = 'groups/FETCH_PLAYER_GROUPS_FAILURE';

export const UPDATE_MEMBERS_REQUEST = 'groups/UPDATE_GROUP_MEMBERS_REQUEST';
export const UPDATE_MEMBERS_SUCCESS = 'groups/UPDATE_GROUP_MEMBERS_SUCCESS';
export const UPDATE_MEMBERS_FAILURE = 'groups/UPDATE_GROUP_MEMBERS_FAILURE';

const initialState = {
  isCreating: false,
  isEditing: false,
  isFetchingAll: false,
  isDeleting: false,
  isFetchingDetails: false,
  isFetchingMembers: false,
  isFetchingMonthlyTop: false,
  isFetchingStatistics: false,
  isFetchingPlayerGroups: false,
  groups: {},
  playerGroups: {},
  error: { message: null, data: null }
};

export default function groupsReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_GROUP_REQUEST:
      return { ...state, isCreating: true };

    case CREATE_GROUP_SUCCESS:
      return {
        ...state,
        isCreating: false,
        groups: { ...replaceDetails(state.groups, action.group) }
      };

    case CREATE_GROUP_FAILURE:
      return { ...state, isCreating: false, error: { message: action.error, data: action.data } };

    case EDIT_GROUP_REQUEST:
      return { ...state, isEditing: true };

    case EDIT_GROUP_SUCCESS:
      return {
        ...state,
        isEditing: false,
        groups: { ...replaceDetails(state.groups, action.group) }
      };

    case EDIT_GROUP_FAILURE:
      return { ...state, isEditing: false, error: { message: action.error, data: action.data } };

    case FETCH_GROUPS_REQUEST:
      return { ...state, isFetchingAll: true };

    case FETCH_GROUPS_SUCCESS:
      return {
        ...state,
        isFetchingAll: false,
        groups: action.refresh
          ? { ...toMap(action.groups, 'id') }
          : { ...state.groups, ...toMap(action.groups, 'id') }
      };

    case FETCH_GROUPS_FAILURE:
      return { ...state, isFetchingAll: false, error: { message: action.error } };

    case FETCH_PLAYER_GROUPS_REQUEST:
      return { ...state, isFetchingPlayerGroups: true };

    case FETCH_PLAYER_GROUPS_SUCCESS:
      return {
        ...state,
        isFetchingPlayerGroups: false,
        groups: { ...toMap(action.groups, 'id') },
        playerGroups: { ...state.playerGroups, [action.playerId]: action.groups }
      };

    case FETCH_PLAYER_GROUPS_FAILURE:
      return { ...state, isFetchingPlayerGroups: false, error: { message: action.error } };

    case FETCH_GROUP_REQUEST:
      return { ...state, isFetchingDetails: true };

    case FETCH_GROUP_SUCCESS:
      return {
        ...state,
        isFetchingDetails: false,
        groups: { ...replaceDetails(state.groups, action.group) }
      };

    case FETCH_GROUP_FAILURE:
      return { ...state, isFetchingDetails: false, error: { message: action.error } };

    case FETCH_GROUP_MEMBERS_REQUEST:
      return { ...state, isFetchingMembers: true };

    case FETCH_GROUP_MEMBERS_SUCCESS:
      return {
        ...state,
        isFetchingMembers: false,
        groups: {
          ...state.groups,
          [action.groupId]: { ...state.groups[action.groupId], members: action.members }
        }
      };

    case FETCH_GROUP_MEMBERS_FAILURE:
      return { ...state, isFetchingMembers: false, error: { message: action.error } };

    case FETCH_GROUP_MONTHLY_TOP_REQUEST:
      return { ...state, isFetchingMonthlyTop: true };

    case FETCH_GROUP_MONTHLY_TOP_SUCCESS:
      return {
        ...state,
        isFetchingMonthlyTop: false,
        groups: {
          ...state.groups,
          [action.groupId]: {
            ...state.groups[action.groupId],
            monthlyTopPlayer: action.monthlyTopPlayer
          }
        }
      };

    case FETCH_GROUP_MONTHLY_TOP_FAILURE:
      return { ...state, isFetchingMonthlyTop: false, error: { message: action.error } };

    case FETCH_GROUP_STATISTICS_REQUEST:
      return { ...state, isFetchingStatistics: true };

    case FETCH_GROUP_STATISTICS_SUCCESS:
      return {
        ...state,
        isFetchingStatistics: false,
        groups: {
          ...state.groups,
          [action.groupId]: { ...state.groups[action.groupId], statistics: action.statistics }
        }
      };

    case FETCH_GROUP_STATISTICS_FAILURE:
      return { ...state, isFetchingStatistics: false, error: { message: action.error } };

    case DELETE_GROUP_REQUEST:
      return { ...state, isDeleting: true };

    case DELETE_GROUP_SUCCESS:
      return {
        ...state,
        isDeleting: false,
        groups: { ..._.omit(state.groups, action.groupId) }
      };

    case DELETE_GROUP_FAILURE:
      return { ...state, isDeleting: false, error: { message: action.error } };

    default:
      return state;
  }
}

function replaceDetails(groups, details) {
  // If group is not in the list, simply add it
  if (!groups[details.id]) {
    return { ...groups, [details.id]: details };
  }

  // If it already exists in the list, add the new key:value pairs to it
  return { ...groups, [details.id]: { ...groups[details.id], ...details } };
}
