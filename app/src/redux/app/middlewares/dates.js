import traverse from 'traverse';
import moment from 'moment';

// Convert any ISO date string into a date object
// before it hits its respective reducer
const datesMiddleware = () => next => action => {
  const transformedAction = traverse(action).forEach(val => {
    if (typeof val === 'string' && val.includes('-') && moment(val, moment.ISO_8601).isValid()) {
      return new Date(val);
    }

    return val;
  });

  return next(transformedAction);
};

export default datesMiddleware;
