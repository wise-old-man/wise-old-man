import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './competition.controller';

const api = Router();

api.get('/', setupController(controller.search));
api.post('/', setupController(controller.create));

api.get('/:id', setupController(controller.details));
api.get('/:id/csv', setupController(controller.detailsCSV));
api.get('/:id/top-history', setupController(controller.topHistory));

api.put('/:id', setupController(controller.edit));
api.delete('/:id', setupController(controller.remove));

api.post('/:id/add-participants', setupController(controller.addParticipants));
api.post('/:id/remove-participants', setupController(controller.removeParticipants));
api.post('/:id/add-teams', setupController(controller.addTeams));
api.post('/:id/remove-teams', setupController(controller.removeTeams));
api.post('/:id/update-all', setupController(controller.updateAllParticipants));
api.put('/:id/reset-code', setupController(controller.resetVerificationCode));

export default api;
