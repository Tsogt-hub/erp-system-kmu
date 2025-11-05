import { CompanyModel, CreateCompanyData } from '../models/Company';
import { ContactModel, CreateContactData } from '../models/Contact';

export class CRMService {
  // Companies
  static async getAllCompanies() {
    return await CompanyModel.findAll();
  }

  static async getCompanyById(id: number) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  static async searchCompanies(searchTerm: string) {
    return await CompanyModel.search(searchTerm);
  }

  static async createCompany(data: CreateCompanyData) {
    return await CompanyModel.create(data);
  }

  static async updateCompany(id: number, data: Partial<CreateCompanyData>) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    return await CompanyModel.update(id, data);
  }

  static async deleteCompany(id: number) {
    const company = await CompanyModel.findById(id);
    if (!company) {
      throw new Error('Company not found');
    }
    await CompanyModel.delete(id);
    return { message: 'Company deleted successfully' };
  }

  // Contacts
  static async getAllContacts(category?: string, type?: string, includeArchived: boolean = false) {
    return await ContactModel.findAll(category, type, includeArchived);
  }

  static async getContactById(id: number) {
    const contact = await ContactModel.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return contact;
  }

  static async getContactsByCompany(companyId: number) {
    return await ContactModel.findByCompany(companyId);
  }

  static async searchContacts(searchTerm: string) {
    return await ContactModel.search(searchTerm);
  }

  static async createContact(data: CreateContactData) {
    return await ContactModel.create(data);
  }

  static async updateContact(id: number, data: Partial<CreateContactData>) {
    const contact = await ContactModel.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return await ContactModel.update(id, data);
  }

  static async deleteContact(id: number) {
    const contact = await ContactModel.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    await ContactModel.delete(id);
    return { message: 'Contact deleted successfully' };
  }
}

