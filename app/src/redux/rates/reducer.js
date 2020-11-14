import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isFetching: false,
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
      const { metric, rates } = action.payload;

      state.isFetching = false;
      state.error = null;

      if (metric === 'ehp') {
        state.ehpRates = rates;
      } else {
        state.ehbRates = rates;
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
