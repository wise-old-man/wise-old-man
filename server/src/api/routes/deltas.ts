import { Router } from 'express';
import * as controller from '@controllers/deltas';

const api = Router();

api.get('/leaderboard', controller.leaderboard);

export default api;
