import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.post('/', ProjectController.create);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);

// Project Members
router.get('/:id/members', ProjectController.getMembers);
router.post('/:id/members', ProjectController.addMember);
router.delete('/:id/members', ProjectController.removeMember);

export default router;

