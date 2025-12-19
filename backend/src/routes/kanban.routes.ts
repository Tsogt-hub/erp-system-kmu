import { Router } from 'express';
import { KanbanController } from '../controllers/kanban.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Boards
router.get('/boards', KanbanController.getAllBoards);
router.get('/boards/:id', KanbanController.getBoardById);
router.get('/boards/:id/stats', KanbanController.getBoardStats);
router.post('/boards', KanbanController.createBoard);
router.put('/boards/:id', KanbanController.updateBoard);
router.delete('/boards/:id', KanbanController.deleteBoard);

// Columns
router.get('/boards/:boardId/columns', KanbanController.getColumnsByBoard);
router.post('/boards/:boardId/columns', KanbanController.createColumn);
router.put('/boards/:boardId/columns/reorder', KanbanController.reorderColumns);
router.put('/columns/:id', KanbanController.updateColumn);
router.delete('/columns/:id', KanbanController.deleteColumn);

// Cards
router.get('/columns/:columnId/cards', KanbanController.getCardsByColumn);
router.get('/cards/:id', KanbanController.getCardById);
router.post('/cards', KanbanController.createCard);
router.put('/cards/:id', KanbanController.updateCard);
router.put('/cards/:id/move', KanbanController.moveCard);
router.delete('/cards/:id', KanbanController.deleteCard);
router.put('/columns/:columnId/cards/reorder', KanbanController.reorderCards);

// Activities
router.get('/cards/:cardId/activities', KanbanController.getCardActivities);
router.post('/cards/:cardId/activities', KanbanController.addActivity);
router.delete('/activities/:id', KanbanController.deleteActivity);

export default router;

