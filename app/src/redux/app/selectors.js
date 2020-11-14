import { createSelector } from 'reselect';

const rootSelector = state => state.app;

export const isNotificationVisible = createSelector(rootSelector, root => root.isNotificationVisible);
export const getNotification = createSelector(rootSelector, root => root.currentNotification);
