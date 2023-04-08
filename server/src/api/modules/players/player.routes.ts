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
api.get('/:username/competitions/standings', setupController(controller.competitionStandings));
api.get('/:username/names', setupController(controller.names));
api.put('/:username/country', setupController(controller.changeCountry));
api.get('/:username', setupController(controller.details));
api.post('/:username', setupController(controller.track));
api.post('/:username/rollback', setupController(controller.rollback));
api.post('/:username/archive', setupController(controller.archive));
api.delete('/:username', setupController(controller.deletePlayer));

api.get('/id/:id', setupController(controller.detailsById));

export default api;
