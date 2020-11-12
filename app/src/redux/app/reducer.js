import { createSlice } from '@reduxjs/toolkit';

const emptyNotification = {
  text: '',
  type: 'warn',
  duration: 0
};

const initialState = {
  isNotificationVisible: false,
  currentNotification: { ...emptyNotification }
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    onHideNotification(state) {
      state.isNotificationVisible = false;
      state.currentNotification = emptyNotification;
    },
    onShowNotification(state, action) {
      state.isNotificationVisible = true;
      state.currentNotification = action.payload;
    }
  }
});

// Export the action reducers
export const reducers = slice.actions;
// Export the reducer
export default slice.reducer;
