import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './competition.controller';

const api = Router();

api.get('/', setupController(controller.search));
api.get('/:id', controller.details);
api.get('/:id/csv', controller.detailsCSV);

api.post('/', setupController(controller.create));
api.put('/:id', setupController(controller.edit));
api.delete('/:id', setupController(controller.remove));

api.put('/:id/reset-code', setupController(controller.resetVerificationCode));
api.post('/:id/add-participants', setupController(controller.addParticipants));
api.post('/:id/remove-participants', setupController(controller.removeParticipants));
api.post('/:id/add-teams', setupController(controller.addTeams));
api.post('/:id/remove-teams', setupController(controller.removeTeams));
api.post('/:id/update-all', setupController(controller.updateAllParticipants));

export default api;
