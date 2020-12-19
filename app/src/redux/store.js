import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import loggerMiddleware from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { appMiddlewares } from './app';
import reducers from './reducers';

const store = configureStore({
  reducer: reducers,
  middleware: [
    thunkMiddleware,
    ...appMiddlewares,
    // loggerMiddleware,
    ...getDefaultMiddleware({
      serializableCheck: false
    })
  ]
});

export default store;
