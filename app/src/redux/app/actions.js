import { reducers } from './reducer';

const hideNotification = () => dispatch => {
  dispatch(reducers.onHideNotification());
};

const showNotification = notification => dispatch => {
  dispatch(reducers.onShowNotification(notification));
};

export { hideNotification, showNotification };
