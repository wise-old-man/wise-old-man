/* eslint-disable consistent-return */
import Analytics from 'react-ga';

function sendEvent(category, action, value) {
  Analytics.event({ category, action, value });
}

const analyticsMiddleware = () => next => action => {
  if (!action || !action.type) return;

  switch (action.type) {
    case 'competitions/onCreateSuccess': {
      sendEvent('Competition', 'Created new Competition', action.payload.data.id);
      break;
    }

    case 'competitions/onEditSuccess': {
      sendEvent('Competition', 'Edited Competition', action.payload.data.id);
      break;
    }

    case 'competitions/onDeleteSuccess': {
      sendEvent('Competition', 'Deleted Competition', action.payload.competitionId);
      break;
    }

    case 'competitions/onUpdateAllSuccess': {
      sendEvent('Competition', 'Updated All Participants', action.payload.competitionId);
      break;
    }

    case 'groups/onCreateSuccess': {
      sendEvent('Group', 'Created new Group', action.payload.data.id);
      break;
    }

    case 'groups/onEditSuccess': {
      sendEvent('Group', 'Edited Group', action.payload.data.id);
      break;
    }

    case 'groups/onDeleteSuccess': {
      sendEvent('Group', 'Deleted Group', action.payload.groupId);
      break;
    }

    case 'groups/onUpdateAllSuccess': {
      sendEvent('Group', 'Updated All Members', action.payload.groupId);
      break;
    }

    case 'names/onSubmitSuccess': {
      sendEvent('Name change', 'Submitted new name change', action.payload.data.id);
      break;
    }

    case 'players/onAssertNameSuccess': {
      sendEvent('Player', 'Asserted player name', action.payload.username);
      break;
    }

    case 'players/onAssertTypeSuccess': {
      sendEvent('Player', 'Asserted player type', action.payload.username);
      break;
    }

    case 'players/onTrackSuccess': {
      sendEvent('Player', 'Tracked player', action.payload.username);
      break;
    }

    default:
      break;
  }

  return next(action);
};

export default analyticsMiddleware;
