import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import loggerMiddleware from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import datesMiddleware from './app/middlewares/dates';
import notificationsMiddleware from './app/middlewares/notifications';
import analyticsMiddleware from './app/middlewares/analytics';
import reducers from './reducers';

const store = configureStore({
  reducer: reducers,
  middleware: [
    thunkMiddleware,
    datesMiddleware,
    notificationsMiddleware,
    analyticsMiddleware,
    loggerMiddleware,
    ...getDefaultMiddleware({
      serializableCheck: false
    })
  ]
});

export default store;
