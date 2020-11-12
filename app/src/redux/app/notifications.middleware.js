/* eslint-disable consistent-return */
import * as actions from './actions';

function showError(store, text, duration = 5000) {
  const notification = { type: 'error', text, duration };
  store.dispatch(store.dispatch(actions.showNotification(notification)));
}

function showSuccess(store, text, duration = 5000) {
  const notification = { type: 'success', text, duration };
  store.dispatch(store.dispatch(actions.showNotification(notification)));
}

function showWarning(store, text, duration = 5000) {
  const notification = { type: 'warn', text, duration };
  store.dispatch(store.dispatch(actions.showNotification(notification)));
}

const notificationsMiddleware = store => next => action => {
  if (!action || !action.type) return;

  switch (action.type) {
    /* SUCCESS MESSAGES */

    case 'players/onTrackSuccess': {
      showSuccess(store, `${action.payload.username} has been successfully updated.`);
      break;
    }

    case 'players/onAssertTypeSuccess': {
      showSuccess(store, `Player type successfully reassigned to ${action.playerType}.`);
      break;
    }

    case 'players/onAssertNameSuccess': {
      showSuccess(store, `Player name successfully changed to ${action.displayName}.`);
      break;
    }

    case 'names/onSubmitSuccess': {
      showSuccess(store, 'Name change submitted successfully. Please wait for approval.');
      break;
    }

    case 'competitions/onCreateSuccess': {
      showSuccess(store, 'Competition created successfully.');
      break;
    }

    case 'competitions/onEditSuccess': {
      showSuccess(store, 'Competition edited successfully.');
      break;
    }

    case 'competitions/onDeleteSuccess': {
      showSuccess(store, 'Competition deleted successfully.');
      break;
    }

    case 'groups/onCreateSuccess': {
      showSuccess(store, 'Group created successfully.');
      break;
    }

    case 'groups/onEditSuccess': {
      showSuccess(store, 'Group edited successfully.');
      break;
    }

    case 'groups/onDeleteSuccess': {
      showSuccess(store, 'Group deleted successfully.');
      break;
    }

    case 'groups/onUpdateAllSuccess':
    case 'competitions/onUpdateAllSuccess': {
      showSuccess(store, action.payload.message, 10000);
      break;
    }

    /* WARNING MESSAGES */

    case 'players/onAssertNameRequest': {
      showWarning(store, 'Checking player display name...', 10000);
      break;
    }

    case 'players/onAssertTypeRequest': {
      showWarning(store, 'Reassigning player type...', 10000);
      break;
    }

    /* ERROR MESSAGES */

    case 'groups/onCreateError':
    case 'groups/onEditError':
    case 'groups/onDeleteError':
    case 'groups/onUpdateAllError':
    case 'competitions/onDeleteError':
    case 'competitions/onCreateError':
    case 'competitions/onEditError':
    case 'competitions/onUpdateAllError': {
      showError(store, action.payload.error, 10000);
      break;
    }

    case 'players/onTrackError':
    case 'names/onSubmitError':
    case 'players/onAssertTypeError':
    case 'players/onAssertNameError': {
      showError(store, action.payload);
      break;
    }

    default:
      break;
  }

  return next(action);
};

export default notificationsMiddleware;
