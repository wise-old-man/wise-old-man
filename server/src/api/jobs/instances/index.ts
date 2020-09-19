import AssertPlayerName from './AssertPlayerName';
import AssertPlayerType from './AssertPlayerType';
import CompetitionEnded from './CompetitionEnded';
import CompetitionEnding from './CompetitionEnding';
import CompetitionStarted from './CompetitionStarted';
import CompetitionStarting from './CompetitionStarting';
import ImportPlayer from './ImportPlayer';
import RefreshNameChanges from './RefreshNameChanges';
import RefreshRankings from './RefreshRankings';
import ReviewNameChange from './ReviewNameChange';
import SyncPlayerDeltas from './SyncPlayerDeltas';
import UpdatePlayer from './UpdatePlayer';

export default [
  ImportPlayer,
  UpdatePlayer,
  AssertPlayerName,
  RefreshRankings,
  CompetitionStarted,
  CompetitionStarting,
  CompetitionEnding,
  CompetitionEnded,
  AssertPlayerType,
  SyncPlayerDeltas,
  ReviewNameChange,
  RefreshNameChanges
];
