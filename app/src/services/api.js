import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_BASE_API_URL || 'https://api.wiseoldman.net';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'X-User-Agent': 'WiseOldMan Webapp' }
});

const endpoints = {
  // Efficiency endpoints ✅
  fetchRates: '/efficiency/rates/',
  fetchLeaderboards: '/efficiency/leaderboard/',

  // Name endpoints ✅
  fetchNameChanges: '/names/',
  submitNameChange: '/names/',

  // Record endpoints ✅
  fetchRecordLeaderboards: '/records/leaderboard/',

  // Deltas endpoints ✅
  fetchDeltasLeaderboards: '/deltas/leaderboard/',

  // Group endpoints // ✅
  createGroup: '/groups/',
  deleteGroup: '/groups/:id',
  editGroup: '/groups/:id',
  fetchGroups: '/groups/',
  fetchGroupDetails: '/groups/:id',
  fetchGroupDeltas: '/groups/:id/gained/',
  fetchGroupRecords: '/groups/:id/records/',
  fetchGroupHiscores: '/groups/:id/hiscores/',
  fetchGroupStatistics: '/groups/:id/statistics/',
  fetchGroupMonthlyTop: '/groups/:id/gained/',
  fetchGroupAchievements: '/groups/:id/achievements/',
  fetchGroupNameChanges: '/groups/:id/name-changes/',
  fetchGroupCompetitions: '/groups/:id/competitions/',
  updateAllMembers: '/groups/:id/update-all',
  migrateFromTemple: '/groups/migrate/temple/:id',
  migrateFromCML: '/groups/migrate/cml/:id',

  // Competition endpoints // ✅
  createCompetition: '/competitions/',
  deleteCompetition: '/competitions/:id',
  editCompetition: '/competitions/:id',
  fetchCompetitions: '/competitions/',
  fetchCompetitionDetails: '/competitions/:id',
  fetchCompetitionTopHistory: '/competitions/:id/top-history',
  updateAllParticipants: '/competitions/:id/update-all',

  // Player endpoints
  searchPlayers: '/players/search/', // ✅
  trackPlayer: '/players/:username/', // ✅
  assertPlayerType: '/players/:username/assert-type/', // ✅
  assertPlayerName: '/players/assert-name/', // ✅
  fetchPlayerDetails: '/players/:username', // ✅
  fetchPlayerGroups: '/players/:username/groups/', // ✅
  fetchPlayerAchievements: '/players/:username/achievements/progress', // ✅
  fetchPlayerCompetitions: '/players/:username/competitions/', // ✅
  fetchPlayerSnapshots: '/players/:username/snapshots/',
  fetchPlayerRecords: '/players/:username/records/', // ✅
  fetchPlayerDeltas: '/players/:username/gained/',
  fetchPlayerNames: '/players/:username/names/' // ✅
};

export { endpoints };
export default API;
