import { createSelector } from 'reselect';

const notificationSelector = state => state.notifications;

export const isVisible = createSelector(
  notificationSelector,
  notifications => notifications.isVisible
);

export const getNotification = createSelector(
  notificationSelector,
  notifications => notifications.current
);
