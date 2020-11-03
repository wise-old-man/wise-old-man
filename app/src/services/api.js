import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

const endpoints = {
  fetchRates: '/efficiency/rates/',
  fetchGroupHiscores: '/groups/:groupId/hiscores/'
};

export { endpoints };
export default API;
