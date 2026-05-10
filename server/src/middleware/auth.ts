import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Không có token xác thực' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

/** Only allow 'quan_ly' role */
export function requireManager(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'quan_ly') {
    res.status(403).json({ success: false, error: 'Chỉ Quản lý mới có quyền thực hiện' });
    return;
  }
  next();
}

/** Only allow 'sale' role */
export function requireSales(req: Request, res: Response, next: NextFunction): void {
  const role = req.user?.role as any;
  if (role !== 'nv_sale' && role !== 'sale') {
    res.status(403).json({ success: false, error: 'Chỉ nhân viên Sales mới có quyền thực hiện' });
    return;
  }
  next();
}

/** Allow both 'quan_ly' and 'sale' roles */
export function requireManagerOrSales(req: Request, res: Response, next: NextFunction): void {
  const role = req.user?.role as any;
  if (role !== 'quan_ly' && role !== 'nv_sale' && role !== 'sale') {
    res.status(403).json({ success: false, error: 'Cần quyền Quản lý hoặc Sales để thực hiện' });
    return;
  }
  next();
}

/** Only allow 'phu_trach' role */
export function requireOfficer(req: Request, res: Response, next: NextFunction): void {
  const role = req.user?.role as any;
  if (role !== 'nv_phu_trach' && role !== 'phu_trach') {
    res.status(403).json({ success: false, error: 'Chỉ nhân viên Phụ trách mới có quyền thực hiện' });
    return;
  }
  next();
}

/** Only allow 'ke_toan' role */
export function requireAccountant(req: Request, res: Response, next: NextFunction): void {
  const role = req.user?.role as any;
  if (role !== 'nv_ke_toan' && role !== 'ke_toan') {
    res.status(403).json({ success: false, error: 'Chỉ nhân viên Kế toán mới có quyền thực hiện' });
    return;
  }
  next();
}
