import AssertPlayerType from './AssertPlayerType';
import InvalidateDeltas from './InvalidateDeltas';
import RefreshCompetitionRankings from './RefreshCompetitionRankings';
import RefreshGroupRankings from './RefreshGroupRankings';
import RefreshNameChanges from './RefreshNameChanges';
import ReviewNameChange from './ReviewNameChange';
import ReviewPlayerType from './ReviewPlayerType';
import ScheduleCompetitionEvents from './ScheduleCompetitionEvents';
import UpdatePlayer from './UpdatePlayer';

export default [
  UpdatePlayer,
  RefreshGroupRankings,
  RefreshCompetitionRankings,
  AssertPlayerType,
  ReviewNameChange,
  RefreshNameChanges,
  ReviewPlayerType,
  ScheduleCompetitionEvents,
  InvalidateDeltas
];
