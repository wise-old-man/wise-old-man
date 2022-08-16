import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './player.controller';

const api = Router();

api.get('/search', setupController(controller.search));

api.post('/:username/import-history', setupController(controller.importPlayer));
api.post('/:username/assert-type', setupController(controller.assertType));
api.get('/:username/groups', setupController(controller.groups));
api.get('/:username/gained', setupController(controller.gained));
api.get('/:username/records', setupController(controller.records));
api.get('/:username/snapshots', setupController(controller.snapshots));
api.get('/:username/achievements', setupController(controller.achievements));
api.get('/:username/achievements/progress', setupController(controller.achievementsProgress));
api.get('/:username/competitions', setupController(controller.competitions));
api.get('/:username/names', setupController(controller.names));
api.put('/:username/country', setupController(controller.changeCountry));
api.get('/:username', setupController(controller.details));
api.post('/:username', setupController(controller.track));
api.delete('/:username', setupController(controller.deletePlayer));

api.get('/id/:id/groups', setupController(controller.groups));
api.get('/id/:id/gained', setupController(controller.gained));
api.get('/id/:id/records', setupController(controller.records));
api.get('/id/:id/snapshots', setupController(controller.snapshots));
api.get('/id/:id/achievements', setupController(controller.achievements));
api.get('/id/:id/achievements/progress', setupController(controller.achievementsProgress));
api.get('/id/:id/competitions', setupController(controller.competitions));
api.get('/id/:id/names', setupController(controller.names));
api.get('/id/:id', setupController(controller.details));

export default api;
