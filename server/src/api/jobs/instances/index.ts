import AddToGroupCompetitions from './AddToGroupCompetitions';
import AssertPlayerName from './AssertPlayerNames';
import CompetitionEnded from './CompetitionEnded';
import CompetitionEnding from './CompetitionEnding';
import CompetitionStarted from './CompetitionStarted';
import CompetitionStarting from './CompetitionStarting';
import ImportPlayer from './ImportPlayer';
import ReevaluatePlayerAchievements from './ReevaluatePlayerAchievements';
import RefreshRankings from './RefreshRankings';
import RemoveFromGroupCompetitions from './RemoveFromGroupCompetitions';
import SyncPlayerAchievements from './SyncPlayerAchievements';
import SyncPlayerInitialValues from './SyncPlayerInitialValues';
import SyncPlayerRecords from './SyncPlayerRecords';
import UpdatePlayer from './UpdatePlayer';

export default [
  ImportPlayer,
  UpdatePlayer,
  SyncPlayerRecords,
  SyncPlayerAchievements,
  AddToGroupCompetitions,
  RemoveFromGroupCompetitions,
  ReevaluatePlayerAchievements,
  SyncPlayerInitialValues,
  AssertPlayerName,
  RefreshRankings,
  CompetitionStarted,
  CompetitionStarting,
  CompetitionEnding,
  CompetitionEnded
];
