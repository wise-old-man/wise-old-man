import { showNotification } from '../modules/notifications/actions/toggle';
import { TRACK_PLAYER_SUCCESS, TRACK_PLAYER_FAILURE } from '../modules/players/reducer';
import { DELETE_GROUP_FAILURE, DELETE_GROUP_SUCCESS } from '../modules/groups/reducer';
import {
  UPDATE_PARTICIPANTS_SUCCESS,
  UPDATE_PARTICIPANTS_FAILURE,
  CREATE_COMPETITION_FAILURE,
  CREATE_COMPETITION_SUCCESS,
  EDIT_COMPETITION_FAILURE,
  EDIT_COMPETITION_SUCCESS,
  DELETE_COMPETITION_FAILURE,
  DELETE_COMPETITION_SUCCESS
} from '../modules/competitions/reducer';

const notificationsMiddleware = store => next => action => {
  const { type } = action;
  switch (type) {
    case TRACK_PLAYER_SUCCESS: {
      const notification = {
        text: `${action.username} has been successfully updated.`,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case TRACK_PLAYER_FAILURE: {
      const notification = {
        text: action.error,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case CREATE_COMPETITION_FAILURE: {
      const notification = {
        text: action.error,
        duration: 10000,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case CREATE_COMPETITION_SUCCESS: {
      const notification = {
        text: `${action.competition.title} created successfully`,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case EDIT_COMPETITION_FAILURE: {
      const notification = {
        text: action.error,
        duration: 10000,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case EDIT_COMPETITION_SUCCESS: {
      const notification = {
        text: `${action.competition.title} edited successfully`,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case DELETE_COMPETITION_FAILURE: {
      const notification = {
        text: action.error,
        duration: 5000,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case DELETE_COMPETITION_SUCCESS: {
      const notification = {
        text: action.message,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case DELETE_GROUP_FAILURE: {
      const notification = {
        text: action.error,
        duration: 5000,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case DELETE_GROUP_SUCCESS: {
      const notification = {
        text: action.message,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case UPDATE_PARTICIPANTS_SUCCESS: {
      const notification = {
        text: action.message,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case UPDATE_PARTICIPANTS_FAILURE: {
      const notification = {
        text: action.error,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    default:
      break;
  }

  return next(action);
};

export default notificationsMiddleware;
