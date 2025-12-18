import { Request, Response, NextFunction } from 'express';
import { evaluatePolicy } from '../auth/policy-engine';
import { PolicyRequirement } from '../auth/types';

export const accessGuard = (requirement: PolicyRequirement) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Missing user context' });
    }

    const isAllowed = evaluatePolicy(user, requirement);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Forbidden: Policy denied' });
    }

    return next();
  };
};


