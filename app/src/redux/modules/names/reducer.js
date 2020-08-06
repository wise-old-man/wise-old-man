import { toMap } from '../../utils';

export const SUBMIT_NAME_CHANGE_REQUEST = 'names/SUBMIT_NAME_CHANGE_REQUEST';
export const SUBMIT_NAME_CHANGE_SUCCESS = 'names/SUBMIT_NAME_CHANGE_SUCCESS';
export const SUBMIT_NAME_CHANGE_FAILURE = 'names/SUBMIT_NAME_CHANGE_FAILURE';

export const FETCH_NAME_CHANGES_REQUEST = 'names/FETCH_NAME_CHANGES_REQUEST';
export const FETCH_NAME_CHANGES_SUCCESS = 'names/FETCH_NAME_CHANGES_SUCCESS';
export const FETCH_NAME_CHANGES_FAILURE = 'names/FETCH_NAME_CHANGES_FAILURE';

const initialState = {
  isFetchingAll: false,
  isSubmitting: false,
  nameChanges: {},
  error: { message: null, data: null }
};

export default function namesReducer(state = initialState, action) {
  switch (action.type) {
    case SUBMIT_NAME_CHANGE_REQUEST:
      return { ...state, isCreating: true };

    case SUBMIT_NAME_CHANGE_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        nameChanges: { ...state.nameChanges, [action.nameChange.id]: action.nameChange }
      };

    case SUBMIT_NAME_CHANGE_FAILURE:
      return { ...state, isSubmitting: false, error: { message: action.error, data: action.data } };

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
