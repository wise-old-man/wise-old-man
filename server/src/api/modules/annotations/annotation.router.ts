import { Router } from 'express';
import { z } from 'zod';
import { checkAdminPermission } from '../../util/middlewares';
import { PlayerAnnotations } from '../../../prisma';
import { executeRequest, validateRequest } from '../../util/routing';
import { createPlayerAnnotation, fetchPlayerAnnotations, deletePlayerAnnotation } from './services/index';

const router = Router();

router.post(
  '/players/:username/annotation',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string().min(1)
    }),
    body: z.object({
      annotation: z.nativeEnum(PlayerAnnotations)
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { annotation } = req.body;

    const createdAnnotation = await createPlayerAnnotation(username, annotation);

    res.status(201).json(createdAnnotation);
  })
);

router.delete(
  '/players/:username/annotation',
  checkAdminPermission,
  validateRequest({
    params: z.object({
      username: z.string().min(1)
    }),
    body: z.object({
      annotation: z.nativeEnum(PlayerAnnotations)
    })
  }),
  executeRequest(async (req, res) => {
    const { username } = req.params;
    const { annotation } = req.body;

    const deletedAnnotation = await deletePlayerAnnotation(username, annotation);

    res.status(200).json(`Annotation ${deletedAnnotation.type} deleted for player ${username}`);
  })
);

export default router;
