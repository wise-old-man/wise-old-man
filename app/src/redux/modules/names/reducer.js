import { toMap } from '../../utils';

export const FETCH_NAME_CHANGES_REQUEST = 'names/FETCH_NAME_CHANGES_REQUEST';
export const FETCH_NAME_CHANGES_SUCCESS = 'names/FETCH_NAME_CHANGES_SUCCESS';
export const FETCH_NAME_CHANGES_FAILURE = 'names/FETCH_NAME_CHANGES_FAILURE';

const initialState = {
  isFetchingAll: false,
  nameChanges: {},
  error: { message: null, data: null }
};

export default function namesReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_NAME_CHANGES_REQUEST:
      return { ...state, isFetchingAll: true };

    case FETCH_NAME_CHANGES_SUCCESS:
      return {
        ...state,
        isFetchingAll: false,
        nameChanges: action.refresh
          ? { ...toMap(action.nameChanges, 'id') }
          : { ...state.nameChanges, ...toMap(action.nameChanges, 'id') }
      };

    case FETCH_NAME_CHANGES_FAILURE:
      return { ...state, isFetchingAll: false, error: { message: action.error } };

    default:
      return state;
  }
}
