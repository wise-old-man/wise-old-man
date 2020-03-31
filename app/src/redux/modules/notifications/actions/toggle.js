import { HIDE_NOTIFICATION, SHOW_NOTIFICATION } from '../reducer';

export function hideNotification() {
  return dispatch => {
    dispatch({ type: HIDE_NOTIFICATION });
  };
}

export function showNotification({ text, type, duration = 3000 }) {
  return dispatch => {
    dispatch({ type: SHOW_NOTIFICATION, notification: { text, type, duration } });
  };
}
