import { Router } from 'express';
import { setupController } from '../util/routing';
import * as controller from '../controllers/player.controller';

const api = Router();

api.get('/search', setupController(controller.search));
api.post('/track', setupController(controller.track));
api.post('/import', setupController(controller.importPlayer));
api.post('/assert-type', setupController(controller.assertType));

api.get('/username/:username', setupController(controller.details));
api.get('/username/:username/groups', setupController(controller.groups));
api.get('/username/:username/gained', setupController(controller.gained));
api.get('/username/:username/records', setupController(controller.records));
api.get('/username/:username/snapshots', setupController(controller.snapshots));
api.get('/username/:username/achievements', setupController(controller.achievements));
api.get('/username/:username/achievements/progress', setupController(controller.achievementsProgress));
api.get('/username/:username/competitions', setupController(controller.competitions));
api.get('/username/:username/names', setupController(controller.names));
api.put('/username/:username/country', setupController(controller.changeCountry));
api.delete('/username/:username', setupController(controller.deletePlayer));

api.get('/:id', setupController(controller.details));
api.get('/:id/groups', setupController(controller.groups));
api.get('/:id/gained', setupController(controller.gained));
api.get('/:id/records', setupController(controller.records));
api.get('/:id/snapshots', setupController(controller.snapshots));
api.get('/:id/achievements', setupController(controller.achievements));
api.get('/:id/achievements/progress', setupController(controller.achievementsProgress));
api.get('/:id/competitions', setupController(controller.competitions));
api.get('/:id/names', setupController(controller.names));

export default api;
