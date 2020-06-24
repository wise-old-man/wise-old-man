import { Router } from 'express';
import * as controller from './player.controller';

const playerRoutes = Router();

playerRoutes.get('/search', controller.search);
playerRoutes.post('/track', controller.track);
playerRoutes.post('/import', controller.importPlayer);
playerRoutes.post('/assert-type', controller.assertType);
playerRoutes.post('/assert-name', controller.assertName);

playerRoutes.get('/username/:username', controller.details);
playerRoutes.get('/username/:username/groups', controller.groups);
playerRoutes.get('/username/:username/gained', controller.gained);
playerRoutes.get('/username/:username/records', controller.records);
playerRoutes.get('/username/:username/snapshots', controller.snapshots);
playerRoutes.get('/username/:username/achievements', controller.achievements);
playerRoutes.get('/username/:username/competitions', controller.competitions);

playerRoutes.get('/:id', controller.details);
playerRoutes.get('/:id/groups', controller.groups);
playerRoutes.get('/:id/gained', controller.gained);
playerRoutes.get('/:id/records', controller.records);
playerRoutes.get('/:id/snapshots', controller.snapshots);
playerRoutes.get('/:id/achievements', controller.achievements);
playerRoutes.get('/:id/competitions', controller.competitions);

export { playerRoutes };
