import { combineReducers } from '@reduxjs/toolkit';
import notifications from './modules/notifications/reducer';
import competitions from './modules/competitions/reducer';
import players from './modules/players/reducer';
import groups from './modules/groups/reducer';
import names from './modules/names/reducer';
import leaderboards from './modules/leaderboards/reducer';

import hiscores from './hiscores/reducer';
import rates from './rates/reducer';
import snapshots from './snapshots/reducer';
import records from './records/reducer';
import deltas from './deltas/reducer';
import achievements from './achievements/reducer';

const reducer = combineReducers({
  notifications,
  deltas,
  records,
  competitions,
  snapshots,
  players,
  achievements,
  groups,
  hiscores,
  names,
  leaderboards,
  rates
});

export default reducer;
