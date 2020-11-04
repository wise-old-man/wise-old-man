import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

const endpoints = {
  // Efficiency endpoints
  fetchRates: '/efficiency/rates/',

  // Record endpoints
  fetchRecordLeaderboards: '/records/leaderboard/',

  // Group endpoints
  fetchGroupHiscores: '/groups/:groupId/hiscores/',
  fetchGroupRecords: '/groups/:groupId/records/',

  // Player endpoints
  fetchPlayerSnapshots: '/players/username/:username/snapshots/',
  fetchPlayerRecords: '/players/username/:username/records/'
};

export { endpoints };
export default API;
