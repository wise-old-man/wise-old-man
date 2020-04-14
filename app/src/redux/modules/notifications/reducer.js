export const SHOW_NOTIFICATION = 'wise-old-man/notifications/SHOW';
export const HIDE_NOTIFICATION = 'wise-old-man/notifications/HIDE';

const emptyNotification = {
  text: '',
  type: 'warn',
  duration: 0,
};

const initialState = {
  isVisible: false,
  current: {
    ...emptyNotification,
  },
};

export default function notificationsReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return { ...state, isVisible: true, current: action.notification };
    case HIDE_NOTIFICATION:
      return { ...state, isVisible: false, current: { ...emptyNotification } };

    default:
      return state;
  }
}
