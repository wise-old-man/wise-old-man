import { Router } from 'express';
import * as controller from '../controllers/group.controller';

const api = Router();

api.get('/', controller.index);
api.post('/', controller.create);

api.get('/:id', controller.details);
api.put('/:id', controller.edit);
api.delete('/:id', controller.remove);

api.put('/:id/reset-code', controller.resetVerificationCode);
api.put('/:id/verify', controller.verifyGroup);
api.put('/:id/change-role', controller.changeRole);
api.post('/:id/update-all', controller.updateAll);
api.post('/:id/add-members', controller.addMembers);
api.post('/:id/remove-members', controller.removeMembers);

api.get('/:id/members', controller.listMembers);
api.get('/:id/competitions', controller.competitions);
api.get('/:id/monthly-top', controller.monthlyTop);
api.get('/:id/gained', controller.gained);
api.get('/:id/achievements', controller.achievements);
api.get('/:id/records', controller.records);
api.get('/:id/hiscores', controller.hiscores);
api.get('/:id/name-changes', controller.nameChanges);
api.get('/:id/statistics', controller.statistics);

api.get('/migrate/temple/:id', controller.migrateTemple);
api.get('/migrate/cml/:id', controller.migrateCML);

export default api;
