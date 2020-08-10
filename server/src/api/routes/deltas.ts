import { Router } from 'express';
import * as controller from 'api/controllers/deltas';

const api = Router();

api.get('/leaderboard', controller.leaderboard);

export default api;
