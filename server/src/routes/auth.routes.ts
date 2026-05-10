import { Router, Request, Response } from 'express';
import * as AuthBUS from '../bus/auth.bus';
import { authMiddleware, requireManager } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, error: 'Tên đăng nhập và mật khẩu là bắt buộc' });
      return;
    }
    const result = await AuthBUS.login(username, password);
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('[Login Error]:', err);
    res.status(401).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await AuthBUS.getMe(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// POST /api/auth/users (quan_ly only)
router.post('/users', authMiddleware, requireManager, async (req: Request, res: Response) => {
  try {
    const { username, password, ho_ten, role, email } = req.body;
    const user = await AuthBUS.createUser(username, password, ho_ten, role, email);
    res.status(201).json({ success: true, data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/auth/users (quan_ly only)
router.get('/users', authMiddleware, requireManager, async (_req: Request, res: Response) => {
  try {
    const users = await AuthBUS.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
