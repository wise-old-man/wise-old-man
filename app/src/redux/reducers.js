import { combineReducers } from '@reduxjs/toolkit';
import notifications from './modules/notifications/reducer';
import groups from './modules/groups/reducer';

import hiscores from './hiscores/reducer';
import rates from './rates/reducer';
import snapshots from './snapshots/reducer';
import records from './records/reducer';
import deltas from './deltas/reducer';
import names from './names/reducer';
import achievements from './achievements/reducer';
import leaderboards from './leaderboards/reducer';
import players from './players/reducer';
import competitions from './competitions/reducer';

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
