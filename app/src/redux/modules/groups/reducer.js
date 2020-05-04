import _ from 'lodash';
import { toMap } from '../../utils';

export const CREATE_GROUP_REQUEST = 'wise-old-man/groups/CREATE_GROUP_REQUEST';
export const CREATE_GROUP_SUCCESS = 'wise-old-man/groups/CREATE_GROUP_SUCCESS';
export const CREATE_GROUP_FAILURE = 'wise-old-man/groups/CREATE_GROUP_FAILURE';

export const EDIT_GROUP_REQUEST = 'wise-old-man/groups/EDIT_GROUP_REQUEST';
export const EDIT_GROUP_SUCCESS = 'wise-old-man/groups/EDIT_GROUP_SUCCESS';
export const EDIT_GROUP_FAILURE = 'wise-old-man/groups/EDIT_GROUP_FAILURE';

export const DELETE_GROUP_REQUEST = 'wise-old-man/groups/DELETE_GROUP_REQUEST';
export const DELETE_GROUP_SUCCESS = 'wise-old-man/groups/DELETE_GROUP_SUCCESS';
export const DELETE_GROUP_FAILURE = 'wise-old-man/groups/DELETE_GROUP_FAILURE';

export const FETCH_GROUPS_REQUEST = 'wise-old-man/groups/FETCH_LIST_REQUEST';
export const FETCH_GROUPS_SUCCESS = 'wise-old-man/groups/FETCH_LIST_SUCCESS';
export const FETCH_GROUPS_FAILURE = 'wise-old-man/groups/FETCH_LIST_FAILURE';

export const FETCH_GROUP_REQUEST = 'wise-old-man/groups/FETCH_REQUEST';
export const FETCH_GROUP_SUCCESS = 'wise-old-man/groups/FETCH_SUCCESS';
export const FETCH_GROUP_FAILURE = 'wise-old-man/groups/FETCH_FAILURE';

export const FETCH_GROUP_MEMBERS_REQUEST = 'wise-old-man/groups/FETCH_MEMBERS_REQUEST';
export const FETCH_GROUP_MEMBERS_SUCCESS = 'wise-old-man/groups/FETCH_MEMBERS_SUCCESS';
export const FETCH_GROUP_MEMBERS_FAILURE = 'wise-old-man/groups/FETCH_MEMBERS_FAILURE';

export const FETCH_GROUP_MONTHLY_TOP_REQUEST = 'wise-old-man/groups/FETCH_MONTHLY_TOP_REQUEST';
export const FETCH_GROUP_MONTHLY_TOP_SUCCESS = 'wise-old-man/groups/FETCH_MONTHLY_TOP_SUCCESS';
export const FETCH_GROUP_MONTHLY_TOP_FAILURE = 'wise-old-man/groups/FETCH_MONTHLY_TOP_FAILURE';

export const FETCH_PLAYER_GROUPS_REQUEST = 'wise-old-man/groups/FETCH_PLAYER_REQUEST';
export const FETCH_PLAYER_GROUPS_SUCCESS = 'wise-old-man/groups/FETCH_PLAYER_SUCCESS';
export const FETCH_PLAYER_GROUPS_FAILURE = 'wise-old-man/groups/FETCH_PLAYER_FAILURE';

export const UPDATE_MEMBERS_REQUEST = 'wise-old-man/groups/UPDATE_MEMBERS_REQUEST';
export const UPDATE_MEMBERS_SUCCESS = 'wise-old-man/groups/UPDATE_MEMBERS_SUCCESS';
export const UPDATE_MEMBERS_FAILURE = 'wise-old-man/groups/UPDATE_MEMBERS_FAILURE';

const initialState = {
  isCreating: false,
  isEditing: false,
  isFetchingAll: false,
  isDeleting: false,
  isFetchingDetails: false,
  isFetchingMembers: false,
  isFetchingMonthlyTop: false,
  isFetchingPlayerGroups: false,
  groups: {},
  playerGroups: {}
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
      return { ...state, isCreating: false, error: action.error };

    case EDIT_GROUP_REQUEST:
      return { ...state, isEditing: true };

    case EDIT_GROUP_SUCCESS:
      return {
        ...state,
        isEditing: false,
        groups: { ...replaceDetails(state.groups, action.group) }
      };

    case EDIT_GROUP_FAILURE:
      return { ...state, isEditing: false, error: action.error };

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
      return { ...state, isFetchingAll: false, error: action.error };

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
      return { ...state, isFetchingPlayerGroups: false, error: action.error };

    case FETCH_GROUP_REQUEST:
      return { ...state, isFetchingDetails: true };

    case FETCH_GROUP_SUCCESS:
      return {
        ...state,
        isFetchingDetails: false,
        groups: { ...replaceDetails(state.groups, action.group) }
      };

    case FETCH_GROUP_FAILURE:
      return { ...state, isFetchingDetails: false, error: action.error };

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
      return { ...state, isFetchingMembers: false, error: action.error };

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
      return { ...state, isFetchingMonthlyTop: false, error: action.error };

    case DELETE_GROUP_REQUEST:
      return { ...state, isDeleting: true };

    case DELETE_GROUP_SUCCESS:
      return {
        ...state,
        isDeleting: false,
        groups: { ..._.omit(state.groups, action.groupId) }
      };

    case DELETE_GROUP_FAILURE:
      return { ...state, isDeleting: false, error: action.error };

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
