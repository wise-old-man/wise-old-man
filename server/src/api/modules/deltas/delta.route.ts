import { Router } from 'express';
import * as controller from './delta.controller';

const deltaRoutes = Router();

deltaRoutes.get('/leaderboard', controller.leaderboard);

export { deltaRoutes };
