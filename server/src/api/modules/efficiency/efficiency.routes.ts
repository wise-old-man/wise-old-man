import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './efficiency.controller';

const api = Router();

api.get('/leaderboard', setupController(controller.leaderboard));
api.get('/rates', setupController(controller.rates));

export default api;
