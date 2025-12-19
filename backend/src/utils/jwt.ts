import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  permissions: string[];
  attributes: Record<string, unknown>;
}

export const generateToken = (payload: JWTPayload): string => {
  // Cast to any to avoid TypeScript issues with newer jsonwebtoken versions
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as any);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};












