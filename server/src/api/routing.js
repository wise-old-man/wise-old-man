const express = require('express');
const { NotFoundError } = require('./errors');
const { metricAbbreviation } = require('./util/middlewares');
const logger = require('./logger');
const playerRoutes = require('./modules/players/player.route');
const deltaRoutes = require('./modules/deltas/delta.route');
const recordRoutes = require('./modules/records/record.route');
const competitionRoutes = require('./modules/competitions/competition.route');
const groupRoutes = require('./modules/groups/group.route');

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

module.exports = router;
