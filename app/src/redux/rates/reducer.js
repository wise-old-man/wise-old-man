import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetchingRates: false,
  error: null,
  ehpRates: [],
  ehbRates: []
};

const slice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    onFetchRequest(state) {
      state.isFetching = true;
      state.error = null;
    },
    onFetchSuccess(state, action) {
      state.isFetching = false;
      state.error = null;

      if (action.payload.metric === 'ehp') {
        state.ehpRates = action.payload.rates;
      } else {
        state.ehbRates = action.payload.rates;
      }
    },
    onFetchError(state, action) {
      state.isFetching = false;
      state.error = action.payload;
    }
  }
});

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
