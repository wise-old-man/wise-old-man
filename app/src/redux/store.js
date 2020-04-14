import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import reducers from './reducers';
import datesMiddleware from './middlewares/dates';
import notificationsMiddleware from './middlewares/notifications';

const store = createStore(
  reducers,
  applyMiddleware(thunk, logger, datesMiddleware, notificationsMiddleware),
);

export default store;
