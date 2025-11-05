import { TicketModel, CreateTicketData } from '../models/Ticket';

export class TicketService {
  static async getAllTickets(userId?: number) {
    return await TicketModel.findAll(userId);
  }

  static async getTicketById(id: number) {
    const ticket = await TicketModel.findById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    return ticket;
  }

  static async getTicketsByStatus(status: string, userId?: number) {
    return await TicketModel.findByStatus(status, userId);
  }

  static async createTicket(data: CreateTicketData) {
    return await TicketModel.create(data);
  }

  static async updateTicket(id: number, data: Partial<CreateTicketData>) {
    const ticket = await TicketModel.findById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    return await TicketModel.update(id, data);
  }

  static async deleteTicket(id: number) {
    const ticket = await TicketModel.findById(id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    await TicketModel.delete(id);
    return { message: 'Ticket deleted successfully' };
  }
}






