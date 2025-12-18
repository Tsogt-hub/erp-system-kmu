import { AuditLogModel, CreateAuditLogInput } from '../models/AuditLog';

export class AuditService {
  static async list(limit?: number) {
    return AuditLogModel.list(limit);
  }

  static async create(payload: CreateAuditLogInput) {
    return AuditLogModel.create(payload);
  }
}


