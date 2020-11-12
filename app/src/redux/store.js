import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import loggerMiddleware from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import datesMiddleware from './middlewares/dates';
import notificationsMiddleware from './app/notifications.middleware';
import reducers from './reducers';

const store = configureStore({
  reducer: reducers,
  middleware: [
    thunkMiddleware,
    datesMiddleware,
    notificationsMiddleware,
    loggerMiddleware,
    ...getDefaultMiddleware({
      serializableCheck: false
    })
  ]
});

export default store;
