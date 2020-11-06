import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 60000
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
  fetchGroupAchievements: '/groups/:groupId/achievements/',
  fetchGroupHiscores: '/groups/:groupId/hiscores/',
  fetchGroupRecords: '/groups/:groupId/records/',
  fetchGroupDeltas: '/groups/:groupId/gained/',

  // Player endpoints
  trackPlayer: '/players/track/',
  searchPlayers: '/players/search/',
  assertPlayerType: '/players/assert-type/',
  assertPlayerName: '/players/assert-name/',
  fetchPlayerDetails: '/players/username/:username/',
  fetchPlayerAchievements: '/players/username/:username/achievements/',
  fetchPlayerSnapshots: '/players/username/:username/snapshots/',
  fetchPlayerRecords: '/players/username/:username/records/',
  fetchPlayerDeltas: '/players/username/:username/gained/'
};

export { endpoints };
export default API;
