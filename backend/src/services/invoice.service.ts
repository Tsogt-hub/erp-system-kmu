import { InvoiceModel, CreateInvoiceData, CreateInvoiceItemData } from '../models/Invoice';

export class InvoiceService {
  async createInvoice(data: CreateInvoiceData) {
    return await InvoiceModel.create(data);
  }

  async getInvoices(filters?: {
    status?: string;
    contact_id?: number;
    company_id?: number;
    from_date?: Date;
    to_date?: Date;
  }) {
    return await InvoiceModel.findAll(filters);
  }

  async getInvoiceById(id: number) {
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const items = await InvoiceModel.getInvoiceItems(id);
    return { ...invoice, items };
  }

  async updateInvoice(id: number, data: Partial<CreateInvoiceData>) {
    const invoice = await InvoiceModel.update(id, data);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async deleteInvoice(id: number) {
    const success = await InvoiceModel.delete(id);
    if (!success) {
      throw new Error('Invoice not found');
    }
    return { message: 'Invoice deleted successfully' };
  }

  async addInvoiceItem(data: CreateInvoiceItemData) {
    return await InvoiceModel.createInvoiceItem(data);
  }

  async deleteInvoiceItem(id: number) {
    const success = await InvoiceModel.deleteInvoiceItem(id);
    if (!success) {
      throw new Error('Invoice item not found');
    }
    return { message: 'Invoice item deleted successfully' };
  }

  async recordPayment(id: number, amount: number) {
    const invoice = await InvoiceModel.updatePayment(id, amount);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async getOverdueInvoices() {
    const allInvoices = await InvoiceModel.findAll();
    const today = new Date();
    
    return allInvoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      return dueDate < today && invoice.status !== 'paid' && invoice.status !== 'cancelled';
    });
  }

  async getInvoiceStats() {
    const allInvoices = await InvoiceModel.findAll();
    
    const stats = {
      total: allInvoices.length,
      draft: 0,
      sent: 0,
      paid: 0,
      partially_paid: 0,
      overdue: 0,
      cancelled: 0,
      total_revenue: 0,
      outstanding_amount: 0,
    };

    const today = new Date();

    allInvoices.forEach(invoice => {
      stats[invoice.status as keyof typeof stats] = (stats[invoice.status as keyof typeof stats] as number) + 1;
      
      if (invoice.status === 'paid') {
        stats.total_revenue += invoice.total_amount;
      } else if (invoice.status !== 'cancelled') {
        stats.outstanding_amount += (invoice.total_amount - invoice.paid_amount);
      }

      // Check for overdue
      const dueDate = new Date(invoice.due_date);
      if (dueDate < today && invoice.status !== 'paid' && invoice.status !== 'cancelled') {
        stats.overdue++;
      }
    });

    return stats;
  }
}

export default new InvoiceService();
