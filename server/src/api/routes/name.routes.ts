import { Router } from 'express';
import { setupController } from '../util/routing';
import * as controller from '../controllers/name.controller';

const namesRouter = Router();

namesRouter.get('/', setupController(controller.index));
namesRouter.post('/', setupController(controller.submit));
namesRouter.post('/bulk', setupController(controller.bulkSubmit));
namesRouter.get('/:id', setupController(controller.details));
namesRouter.post('/:id/approve', setupController(controller.approve));
namesRouter.post('/:id/deny', setupController(controller.deny));

export default namesRouter;
