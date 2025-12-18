import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TicketService } from '../services/ticket.service';

export class TicketController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { status } = req.query;

      let tickets;
      if (status) {
        tickets = await TicketService.getTicketsByStatus(status as string, userId);
      } else {
        tickets = await TicketService.getAllTickets(userId);
      }

      res.json(tickets);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const ticket = await TicketService.getTicketById(id);
      res.json(ticket);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const ticket = await TicketService.createTicket({
        ...req.body,
        created_by: userId,
      });
      res.status(201).json(ticket);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const ticket = await TicketService.updateTicket(id, req.body);
      res.json(ticket);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await TicketService.deleteTicket(id);
      res.json({ message: 'Ticket deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}


















