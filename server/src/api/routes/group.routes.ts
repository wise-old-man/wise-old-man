import { Router } from 'express';
import { setupController } from '../util/routing';
import * as controller from '../controllers/group.controller';

const api = Router();

api.get('/', setupController(controller.search));
api.post('/', controller.create);

api.get('/:id', setupController(controller.details));
api.put('/:id', controller.edit);
api.delete('/:id', setupController(controller.remove));

api.put('/:id/reset-code', setupController(controller.resetGroupCode));
api.put('/:id/verify', setupController(controller.verifyGroup));
api.put('/:id/change-role', setupController(controller.changeRole));
api.post('/:id/update-all', setupController(controller.updateAll));
api.post('/:id/add-members', setupController(controller.addMembers));
api.post('/:id/remove-members', setupController(controller.removeMembers));

api.get('/:id/members', setupController(controller.listMembers));
api.get('/:id/competitions', controller.competitions);
api.get('/:id/monthly-top', setupController(controller.monthlyTop));
api.get('/:id/gained', setupController(controller.gained));
api.get('/:id/achievements', setupController(controller.achievements));
api.get('/:id/records', setupController(controller.records));
api.get('/:id/hiscores', setupController(controller.hiscores));
api.get('/:id/name-changes', setupController(controller.nameChanges));
api.get('/:id/statistics', setupController(controller.statistics));

api.get('/migrate/temple/:id', controller.migrateTemple);
api.get('/migrate/cml/:id', controller.migrateCML);

export default api;
