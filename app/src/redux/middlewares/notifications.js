import { showNotification } from '../modules/notifications/actions/toggle';
import {
  TRACK_PLAYER_SUCCESS,
  TRACK_PLAYER_FAILURE,
  ASSERT_TYPE_SUCCESS,
  ASSERT_TYPE_FAILURE,
  ASSERT_TYPE_REQUEST,
  ASSERT_NAME_SUCCESS,
  ASSERT_NAME_FAILURE,
  ASSERT_NAME_REQUEST
} from '../modules/players/reducer';
import {
  UPDATE_MEMBERS_SUCCESS,
  UPDATE_MEMBERS_FAILURE,
  CREATE_GROUP_FAILURE,
  CREATE_GROUP_SUCCESS,
  DELETE_GROUP_FAILURE,
  DELETE_GROUP_SUCCESS,
  EDIT_GROUP_FAILURE,
  EDIT_GROUP_SUCCESS
} from '../modules/groups/reducer';
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
import { SUBMIT_NAME_CHANGE_FAILURE, SUBMIT_NAME_CHANGE_SUCCESS } from '../modules/names/reducer';

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

    case ASSERT_TYPE_REQUEST: {
      const notification = {
        text: `Reassigning player type..`,
        type: 'warn',
        duration: 10000
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case ASSERT_TYPE_SUCCESS: {
      const notification = {
        text: `Player type successfully reassigned to ${action.playerType}.`,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case ASSERT_TYPE_FAILURE: {
      const notification = {
        text: action.error,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case ASSERT_NAME_REQUEST: {
      const notification = {
        text: `Checking player display name..`,
        type: 'warn',
        duration: 10000
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case ASSERT_NAME_SUCCESS: {
      const notification = {
        text: `Player name successfully changed to ${action.displayName}.`,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case ASSERT_NAME_FAILURE: {
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

    case CREATE_GROUP_FAILURE: {
      const notification = {
        text: action.error,
        duration: 10000,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case CREATE_GROUP_SUCCESS: {
      const notification = {
        text: `${action.group.name} created successfully`,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case EDIT_GROUP_FAILURE: {
      const notification = {
        text: action.error,
        duration: 10000,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case EDIT_GROUP_SUCCESS: {
      const notification = {
        text: `${action.group.name} edited successfully`,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case UPDATE_PARTICIPANTS_SUCCESS:
    case UPDATE_MEMBERS_SUCCESS: {
      const notification = {
        text: action.message,
        type: 'success'
      };

      store.dispatch(showNotification({ ...notification, duration: 10000 }));
      break;
    }

    case UPDATE_PARTICIPANTS_FAILURE:
    case UPDATE_MEMBERS_FAILURE: {
      const notification = {
        text: action.error,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case SUBMIT_NAME_CHANGE_FAILURE: {
      const notification = {
        text: action.error,
        duration: 10000,
        type: 'error'
      };

      store.dispatch(showNotification({ ...notification }));
      break;
    }

    case SUBMIT_NAME_CHANGE_SUCCESS: {
      const notification = {
        text: `Name change submitted successfully. Please wait for approval.`,
        type: 'success'
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
