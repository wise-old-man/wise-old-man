import { toMap } from '../../utils';

export const FETCH_GROUPS_REQUEST = 'wise-old-man/group/FETCH_LIST_REQUEST';
export const FETCH_GROUPS_SUCCESS = 'wise-old-man/group/FETCH_LIST_SUCCESS';
export const FETCH_GROUPS_FAILURE = 'wise-old-man/group/FETCH_LIST_FAILURE';

const initialState = {
  isFetchingAll: false,
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

    default:
      return state;
  }
}
