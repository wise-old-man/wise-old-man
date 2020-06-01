export const FETCH_GROUP_HISCORES_REQUEST = 'wise-old-man/hiscores/FETCH_GROUP_HISCORES_REQUEST';
export const FETCH_GROUP_HISCORES_SUCCESS = 'wise-old-man/hiscores/FETCH_GROUP_HISCORES_SUCCESS';
export const FETCH_GROUP_HISCORES_FAILURE = 'wise-old-man/hiscores/FETCH_GROUP_HISCORES_FAILURE';

const initialState = {
  isFetchingGroupHiscores: false,
  groupHiscores: {}
};

export default function hiscoresReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_GROUP_HISCORES_REQUEST:
      return { ...state, isFetchingGroupHiscores: true };

    case FETCH_GROUP_HISCORES_SUCCESS:
      return {
        ...state,
        isFetchingGroupHiscores: false,
        groupHiscores: { ...state.groupHiscores, [action.groupId]: action.hiscores }
      };

    case FETCH_GROUP_HISCORES_FAILURE:
      return { ...state, isFetchingGroupHiscores: false, error: action.error };

    default:
      return state;
  }
}
