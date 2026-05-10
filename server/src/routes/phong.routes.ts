import { Router, Request, Response } from "express";
import * as PhongBUS from '../bus/phong.bus';
import { authMiddleware, requireManager, requireSales } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  // Both Manager and Sales can check room status
  const user = (req as any).user;
  if (user?.role !== 'quan_ly' && user?.role !== 'nv_sale' && user?.role !== 'sale') {
    return res.status(403).json({ success: false, error: 'Không có quyền truy cập thông tin phòng' });
  }
  try {
    const { khu_vuc, trang_thai, search } = req.query as Record<string, string>;
    const data = await PhongBUS.getAll(khu_vuc, trang_thai, search);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const data = await PhongBUS.getStats();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await PhongBUS.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

export default router;
