export const FETCH_RATES_REQUEST = 'efficiency/FETCH_RATES_REQUEST';
export const FETCH_RATES_SUCCESS = 'efficiency/FETCH_RATES_SUCCESS';
export const FETCH_RATES_FAILURE = 'efficiency/FETCH_RATES_FAILURE';

const initialState = {
  isFetchingRates: false,
  ehpRates: [],
  ehbRates: []
};

export default function ratesReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_RATES_REQUEST:
      return { ...state, isFetchingRates: true };

    case FETCH_RATES_SUCCESS: {
      return {
        ...state,
        isFetchingRates: false,
        [action.metric === 'ehp' ? 'ehpRates' : 'ehbRates']: action.rates
      };
    }

    case FETCH_RATES_FAILURE:
      return { ...state, isFetchingRates: false, error: action.error };

    default:
      return state;
  }
}
