import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './record.controller';

const api = Router();

api.get('/leaderboard', setupController(controller.leaderboard));

export default api;
