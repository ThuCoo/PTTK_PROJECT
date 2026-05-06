import { Router, Request, Response } from 'express';
import * as PhongBUS from '../bus/phong.bus';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
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
    const data = await PhongBUS.getById(parseInt(req.params.id));
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

export default router;
