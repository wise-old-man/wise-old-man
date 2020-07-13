import { Router } from 'express';
import * as controller from './record.controller';

const api = Router();

api.get('/leaderboard', controller.leaderboard);

export default api;
