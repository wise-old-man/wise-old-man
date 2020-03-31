const express = require('express');
const { NotFoundError } = require('./errors');
const playerRoutes = require('./modules/players/player.route');
const deltaRoutes = require('./modules/deltas/delta.route');
const snapshotRoutes = require('./modules/snapshots/snapshot.route');
const recordRoutes = require('./modules/records/record.route');
const competitionRoutes = require('./modules/competitions/competition.route');
const groupRoutes = require('./modules/groups/group.route');
const achievementRoutes = require('./modules/achievements/achievement.route');

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
router.use('/groups', groupRoutes);
router.use('/achievements', achievementRoutes);

// Handle endpoint not found
router.use((req, res, next) => {
  next(new NotFoundError('Endpoint was not found'));
});

// Handle errors
router.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({ message: error.message });
});

module.exports = router;
