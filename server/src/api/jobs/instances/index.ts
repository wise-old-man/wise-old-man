import AssertPlayerType from './AssertPlayerType';
import InvalidateDeltas from './InvalidateDeltas';
import ScheduleCompetitionScoreUpdates from './ScheduleCompetitionScoreUpdates';
import ScheduleGroupScoreUpdates from './ScheduleGroupScoreUpdates';
import RefreshNameChanges from './RefreshNameChanges';
import ReviewNameChange from './ReviewNameChange';
import ReviewPlayerType from './ReviewPlayerType';
import ScheduleCompetitionEvents from './ScheduleCompetitionEvents';
import UpdatePlayer from './UpdatePlayer';
import UpdateGroupScore from './UpdateGroupScore';
import UpdateCompetitionScore from './UpdateCompetitionScore';

export default [
  UpdatePlayer,
  ScheduleGroupScoreUpdates,
  ScheduleCompetitionScoreUpdates,
  AssertPlayerType,
  ReviewNameChange,
  RefreshNameChanges,
  ReviewPlayerType,
  ScheduleCompetitionEvents,
  InvalidateDeltas,
  UpdateGroupScore,
  UpdateCompetitionScore
];
