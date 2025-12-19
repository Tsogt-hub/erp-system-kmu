import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { KanbanService } from '../services/kanban.service';

export class KanbanController {
  // ============ BOARDS ============
  static async getAllBoards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const boards = await KanbanService.getAllBoards(userId);
      res.json(boards);
    } catch (error: any) {
      next(error);
    }
  }

  static async getBoardById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const board = await KanbanService.getBoardById(id);
      res.json(board);
    } catch (error: any) {
      next(error);
    }
  }

  static async createBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const board = await KanbanService.createBoard({
        ...req.body,
        created_by: userId,
      });
      res.status(201).json(board);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const board = await KanbanService.updateBoard(id, req.body);
      res.json(board);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await KanbanService.deleteBoard(id);
      res.json({ message: 'Board deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  static async getBoardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const stats = await KanbanService.getBoardStats(id);
      res.json(stats);
    } catch (error: any) {
      next(error);
    }
  }

  // ============ COLUMNS ============
  static async getColumnsByBoard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const boardId = parseInt(req.params.boardId);
      const columns = await KanbanService.getColumnsByBoard(boardId);
      res.json(columns);
    } catch (error: any) {
      next(error);
    }
  }

  static async createColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const boardId = parseInt(req.params.boardId);
      const column = await KanbanService.createColumn({
        ...req.body,
        board_id: boardId,
      });
      res.status(201).json(column);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const column = await KanbanService.updateColumn(id, req.body);
      res.json(column);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await KanbanService.deleteColumn(id);
      res.json({ message: 'Column deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  static async reorderColumns(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const boardId = parseInt(req.params.boardId);
      const { columnIds } = req.body;
      await KanbanService.reorderColumns(boardId, columnIds);
      res.json({ message: 'Columns reordered successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  // ============ CARDS ============
  static async getCardsByColumn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const columnId = parseInt(req.params.columnId);
      const cards = await KanbanService.getCardsByColumn(columnId);
      res.json(cards);
    } catch (error: any) {
      next(error);
    }
  }

  static async getCardById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const card = await KanbanService.getCardById(id);
      res.json(card);
    } catch (error: any) {
      next(error);
    }
  }

  static async createCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const card = await KanbanService.createCard({
        ...req.body,
        created_by: userId,
      });
      res.status(201).json(card);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const card = await KanbanService.updateCard(id, req.body, userId);
      res.json(card);
    } catch (error: any) {
      next(error);
    }
  }

  static async moveCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const id = parseInt(req.params.id);
      const { column_id, position } = req.body;
      const card = await KanbanService.moveCard(id, column_id, position, userId);
      res.json(card);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await KanbanService.deleteCard(id);
      res.json({ message: 'Card deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  static async reorderCards(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const columnId = parseInt(req.params.columnId);
      const { cardIds } = req.body;
      await KanbanService.reorderCards(columnId, cardIds);
      res.json({ message: 'Cards reordered successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  // ============ ACTIVITIES ============
  static async getCardActivities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cardId = parseInt(req.params.cardId);
      const activities = await KanbanService.getCardActivities(cardId);
      res.json(activities);
    } catch (error: any) {
      next(error);
    }
  }

  static async addActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cardId = parseInt(req.params.cardId);
      const activity = await KanbanService.addActivity({
        ...req.body,
        card_id: cardId,
        user_id: userId,
      });
      res.status(201).json(activity);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await KanbanService.deleteActivity(id);
      res.json({ message: 'Activity deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

