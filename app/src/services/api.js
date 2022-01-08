import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_BASE_API_URL || 'https://league.wiseoldman.net/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'X-User-Agent': 'WiseOldMan Webapp' }
});

const endpoints = {
  // Efficiency endpoints
  fetchRates: '/efficiency/rates/',
  fetchLeaderboards: '/efficiency/leaderboard/',

  // Name endpoints
  fetchNameChanges: '/names/',
  submitNameChange: '/names/',

  // Record endpoints
  fetchRecordLeaderboards: '/records/leaderboard/',

  // Deltas endpoints
  fetchDeltasLeaderboards: '/deltas/leaderboard/',

  // Group endpoints
  createGroup: '/groups/',
  deleteGroup: '/groups/:id',
  editGroup: '/groups/:id',
  fetchGroups: '/groups/',
  fetchGroupDetails: '/groups/:id',
  fetchGroupDeltas: '/groups/:id/gained/',
  fetchGroupRecords: '/groups/:id/records/',
  fetchGroupMembers: '/groups/:id/members/',
  fetchGroupHiscores: '/groups/:id/hiscores/',
  fetchGroupStatistics: '/groups/:id/statistics/',
  fetchGroupMonthlyTop: '/groups/:id/monthly-top/',
  fetchGroupAchievements: '/groups/:id/achievements/',
  fetchGroupNameChanges: '/groups/:id/name-changes/',
  fetchGroupCompetitions: '/groups/:id/competitions/',
  updateAllMembers: '/groups/:id/update-all',
  migrateFromTemple: '/groups/migrate/temple/:id',
  migrateFromCML: '/groups/migrate/cml/:id',

  // Competition endpoints
  createCompetition: '/competitions/',
  deleteCompetition: '/competitions/:id',
  editCompetition: '/competitions/:id',
  fetchCompetitions: '/competitions/',
  fetchCompetitionDetails: '/competitions/:id',
  updateAllParticipants: '/competitions/:id/update-all',

  // Player endpoints
  trackPlayer: '/players/track/',
  searchPlayers: '/players/search/',
  assertPlayerType: '/players/assert-type/',
  assertPlayerName: '/players/assert-name/',
  fetchPlayerDetails: '/players/username/:username/',
  fetchPlayerGroups: '/players/username/:username/groups/',
  fetchPlayerAchievements: '/players/username/:username/achievements/progress',
  fetchPlayerCompetitions: '/players/username/:username/competitions/',
  fetchPlayerSnapshots: '/players/username/:username/snapshots/',
  fetchPlayerRecords: '/players/username/:username/records/',
  fetchPlayerDeltas: '/players/username/:username/gained/',
  fetchPlayerNames: '/players/username/:username/names/'
};

export { endpoints };
export default API;
