export const FETCH_SNAPSHOTS_REQUEST = 'snapshots/FETCH_SNAPSHOTS_REQUEST';
export const FETCH_SNAPSHOTS_SUCCESS = 'snapshots/FETCH_SNAPSHOTS_SUCCESS';
export const FETCH_SNAPSHOTS_FAILURE = 'snapshots/FETCH_SNAPSHOTS_FAILURE';

const initialState = {
  isFetchingSnapshots: false,
  snapshots: {}
};

export default function snapshotsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_SNAPSHOTS_REQUEST:
      return { ...state, isFetchingSnapshots: true };

    case FETCH_SNAPSHOTS_SUCCESS:
      return {
        ...state,
        isFetchingSnapshots: false,
        snapshots: {
          ...state.snapshots,
          [action.username]: {
            ...state.snapshots[action.username],
            [action.period]: action.snapshotData
          }
        }
      };

    case FETCH_SNAPSHOTS_FAILURE:
      return { ...state, isFetchingSnapshots: false, error: action.error };
    default:
      return state;
  }
}
