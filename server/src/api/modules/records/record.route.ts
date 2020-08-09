import { Router } from 'express';
import * as controller from '@controllers/records';

const api = Router();

api.get('/leaderboard', controller.leaderboard);

export default api;
