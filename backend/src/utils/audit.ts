import { AuditLogModel, CreateAuditLogInput } from '../models/AuditLog';
import { logger } from './logger';

export async function recordAuditEvent(payload: CreateAuditLogInput) {
  try {
    await AuditLogModel.create(payload);
  } catch (error: any) {
    logger.warn('Audit-Event konnte nicht gespeichert werden', { error: error.message });
  }
}


