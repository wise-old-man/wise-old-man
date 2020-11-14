import * as appActions from './actions';
import * as appSelectors from './selectors';
import analytics from './middlewares/analytics';
import notifications from './middlewares/notifications';
import dates from './middlewares/dates';

const appMiddlewares = [analytics, notifications, dates];

export { appActions, appSelectors, appMiddlewares };
