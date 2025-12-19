import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import invoiceService from '../services/invoice.service';

export class InvoiceController {
  async createInvoice(req: AuthRequest, res: Response) {
    try {
      const invoice = await invoiceService.createInvoice({
        ...req.body,
        created_by: req.user?.userId || 1,
      });
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInvoices(req: Request, res: Response) {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        contact_id: req.query.contact_id ? parseInt(req.query.contact_id as string) : undefined,
        company_id: req.query.company_id ? parseInt(req.query.company_id as string) : undefined,
        from_date: req.query.from_date ? new Date(req.query.from_date as string) : undefined,
        to_date: req.query.to_date ? new Date(req.query.to_date as string) : undefined,
      };
      const invoices = await invoiceService.getInvoices(filters);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInvoiceById(req: Request, res: Response) {
    try {
      const invoice = await invoiceService.getInvoiceById(parseInt(req.params.id));
      res.json(invoice);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateInvoice(req: Request, res: Response) {
    try {
      const invoice = await invoiceService.updateInvoice(parseInt(req.params.id), req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async deleteInvoice(req: Request, res: Response) {
    try {
      await invoiceService.deleteInvoice(parseInt(req.params.id));
      res.json({ message: 'Invoice deleted successfully' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async addInvoiceItem(req: Request, res: Response) {
    try {
      const item = await invoiceService.addInvoiceItem({
        invoice_id: parseInt(req.params.id),
        ...req.body,
      });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteInvoiceItem(req: Request, res: Response) {
    try {
      await invoiceService.deleteInvoiceItem(parseInt(req.params.itemId));
      res.json({ message: 'Invoice item deleted successfully' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async recordPayment(req: Request, res: Response) {
    try {
      const { amount } = req.body;
      const invoice = await invoiceService.recordPayment(parseInt(req.params.id), amount);
      res.json(invoice);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getOverdueInvoices(req: Request, res: Response) {
    try {
      const invoices = await invoiceService.getOverdueInvoices();
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInvoiceStats(req: Request, res: Response) {
    try {
      const stats = await invoiceService.getInvoiceStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new InvoiceController();
