import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CRMService } from '../services/crm.service';

export class CRMController {
  // Companies
  static async getAllCompanies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const companies = search
        ? await CRMService.searchCompanies(search as string)
        : await CRMService.getAllCompanies();
      res.json(companies);
    } catch (error: any) {
      next(error);
    }
  }

  static async getCompanyById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const company = await CRMService.getCompanyById(id);
      res.json(company);
    } catch (error: any) {
      next(error);
    }
  }

  static async createCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const company = await CRMService.createCompany(req.body);
      res.status(201).json(company);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const company = await CRMService.updateCompany(id, req.body);
      res.json(company);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await CRMService.deleteCompany(id);
      res.json({ message: 'Company deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  // Contacts
  static async getAllContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, companyId, category, type, archived } = req.query;
      let contacts;
      if (companyId) {
        contacts = await CRMService.getContactsByCompany(parseInt(companyId as string));
      } else if (search) {
        contacts = await CRMService.searchContacts(search as string);
      } else {
        const includeArchived = archived === 'true';
        contacts = await CRMService.getAllContacts(
          category as string | undefined,
          type as string | undefined,
          includeArchived
        );
      }
      res.json(contacts);
    } catch (error: any) {
      next(error);
    }
  }

  static async getContactById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const contact = await CRMService.getContactById(id);
      res.json(contact);
    } catch (error: any) {
      next(error);
    }
  }

  static async createContact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const contact = await CRMService.createContact(req.body);
      res.status(201).json(contact);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateContact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const contact = await CRMService.updateContact(id, req.body);
      res.json(contact);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteContact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await CRMService.deleteContact(id);
      res.json({ message: 'Contact deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

