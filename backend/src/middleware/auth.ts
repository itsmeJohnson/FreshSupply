import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface CustomerAuthPayload {
  customerId: number;
  email: string;
  businessName: string;
  type: 'customer';
}

export interface StaffAuthPayload {
  staffId: number;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  type: 'staff';
}

export interface AuthenticatedRequest extends Request {
  customer?: CustomerAuthPayload;
  staff?: StaffAuthPayload;
}

export function requireCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (decoded.type !== 'customer') {
      res.status(403).json({ success: false, error: 'Forbidden: Customer access required' });
      return;
    }
    req.customer = decoded as CustomerAuthPayload;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Unauthorized: Token expired or invalid' });
  }
}

export function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid staff token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (decoded.type !== 'staff') {
      res.status(403).json({ success: false, error: 'Forbidden: Staff access required' });
      return;
    }
    req.staff = decoded as StaffAuthPayload;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Unauthorized: Staff token expired or invalid' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireStaff(req, res, () => {
    if (req.staff?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Administrative privileges required' });
      return;
    }
    next();
  });
}
