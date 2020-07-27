import { Router } from 'express';
import * as controller from './player.controller';

const api = Router();

api.get('/search', controller.search);
api.post('/track', controller.track);
api.post('/import', controller.importPlayer);
api.post('/assert-type', controller.assertType);
api.post('/assert-name', controller.assertName);

api.get('/username/:username', controller.details);
api.get('/username/:username/groups', controller.groups);
api.get('/username/:username/gained', controller.gained);
api.get('/username/:username/records', controller.records);
api.get('/username/:username/snapshots', controller.snapshots);
api.get('/username/:username/achievements', controller.achievements);
api.get('/username/:username/competitions', controller.competitions);

api.get('/:id', controller.details);
api.get('/:id/groups', controller.groups);
api.get('/:id/gained', controller.gained);
api.get('/:id/records', controller.records);
api.get('/:id/snapshots', controller.snapshots);
api.get('/:id/achievements', controller.achievements);
api.get('/:id/competitions', controller.competitions);

export default api;
