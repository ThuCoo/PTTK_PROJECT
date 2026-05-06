import { Router, Request, Response } from 'express';
import * as KhachHangBUS from '../bus/khachHang.bus';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, trang_thai } = req.query as Record<string, string>;
    const data = await KhachHangBUS.getAll(search, trang_thai);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await KhachHangBUS.getById((req.params.id));
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    
    const data = await KhachHangBUS.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = await KhachHangBUS.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    console.log('req ',req)
    await KhachHangBUS.updateStatus(req.params.id, req.body.trang_thai);
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
