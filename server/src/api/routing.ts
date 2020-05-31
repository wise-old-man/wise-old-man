import express from 'express';
import { NotFoundError } from './errors';
import * as playerRoutes from './modules/players/player.route'
import * as deltaRoutes from './modules/deltas/delta.route'
import * as snapshotRoutes from './modules/snapshots/snapshot.route'
import * as recordRoutes from './modules/records/record.route'
import * as competitionRoutes from './modules/competitions/competition.route'
import * as achievementRoutes from './modules/achievements/achievement.route'
import * as groupRoutes from './modules/groups/group.route'

const router = express.Router();

router.get('/', (req, res) => {
  res.json(true);
});

// Register all the modules to the router
router.use('/players', playerRoutes);
router.use('/snapshots', snapshotRoutes);
router.use('/deltas', deltaRoutes);
router.use('/records', recordRoutes);
router.use('/competitions', competitionRoutes);
router.use('/achievements', achievementRoutes);
router.use('/groups', groupRoutes);

// Handle endpoint not found
router.use((req, res, next) => {
  next(new NotFoundError('Endpoint was not found'));
});

// Handle errors
router.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ message: error.message, data: error.data });
});

export default router;
