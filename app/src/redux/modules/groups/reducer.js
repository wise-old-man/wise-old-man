import { toMap } from '../../utils';

export const FETCH_GROUPS_REQUEST = 'wise-old-man/groups/FETCH_LIST_REQUEST';
export const FETCH_GROUPS_SUCCESS = 'wise-old-man/groups/FETCH_LIST_SUCCESS';
export const FETCH_GROUPS_FAILURE = 'wise-old-man/groups/FETCH_LIST_FAILURE';

export const FETCH_GROUP_REQUEST = 'wise-old-man/groups/FETCH_REQUEST';
export const FETCH_GROUP_SUCCESS = 'wise-old-man/groups/FETCH_SUCCESS';
export const FETCH_GROUP_FAILURE = 'wise-old-man/groups/FETCH_FAILURE';

const initialState = {
  isFetchingAll: false,
  isFetchingDetails: false,
  groups: {}
};

export default function groupsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_GROUPS_REQUEST:
      return { ...state, isFetchingAll: true };

    case FETCH_GROUPS_SUCCESS:
      return {
        ...state,
        isFetchingAll: false,
        groups: { ...toMap(action.groups, 'id') }
      };

    case FETCH_GROUPS_FAILURE:
      return { ...state, isFetchingAll: false, error: action.error };

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
