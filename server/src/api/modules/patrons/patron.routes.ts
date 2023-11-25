import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './patron.controller';

const patronsRouter = Router();

patronsRouter.put('/claim/:discordId', setupController(controller.claimBenefits));

export default patronsRouter;
