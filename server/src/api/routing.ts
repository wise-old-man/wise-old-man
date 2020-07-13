import express from 'express';
import * as logger from './logger';
import { NotFoundError } from './errors';
import { playerRoutes } from './modules/players/player.route';
import { deltaRoutes } from './modules/deltas/delta.route';
import { recordRoutes } from './modules/records/record.route';
import { competitionRoutes } from './modules/competitions/competition.route';
import { groupRoutes } from './modules/groups/group.route';
import { metricAbbreviation } from './util/middlewares';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(true);
});

// Handle metric abbreviations (tob -> theatre_of_blood)
router.use(metricAbbreviation);

// Register all the modules to the router
router.use('/players', playerRoutes);
router.use('/deltas', deltaRoutes);
router.use('/records', recordRoutes);
router.use('/competitions', competitionRoutes);
router.use('/groups', groupRoutes);

// Handle endpoint not found
router.use((req, res, next) => {
  next(new NotFoundError('Endpoint was not found'));
});

// Handle errors
router.use((error, req, res, next) => {
  const { query, params, body, originalUrl } = req;

  logger.error(`Failed endpoint (${originalUrl})`, {
    data: { query, params, body },
    error
  });

  res.status(error.statusCode || 500).json({ message: error.message, data: error.data });
});

export { router };
