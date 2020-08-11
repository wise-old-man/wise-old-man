import { Router } from 'express';
import * as controller from 'api/controllers/record.controller';

const api = Router();

api.get('/leaderboard', controller.leaderboard);

export default api;
