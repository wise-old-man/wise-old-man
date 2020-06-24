import { Router } from 'express';
import * as controller from './record.controller';

const recordRoutes = Router();

recordRoutes.get('/leaderboard', controller.leaderboard);

export { recordRoutes };
