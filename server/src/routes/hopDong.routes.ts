import { Router, Request, Response } from 'express';
import * as HopDongBUS from '../bus/hopDong.bus';
import { authMiddleware, requireQl } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, trang_thai } = req.query as Record<string, string>;
    res.json({ success: true, data: await HopDongBUS.getAll(search, trang_thai) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await HopDongBUS.getStats() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await HopDongBUS.getById(parseInt(req.params.id)) });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = await HopDongBUS.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/:id/sign', async (req: Request, res: Response) => {
  try {
    await HopDongBUS.sign(parseInt(req.params.id));
    res.json({ success: true, message: 'Hợp đồng đã ký thành công' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/:id/terminate', requireQl, async (req: Request, res: Response) => {
  try {
    await HopDongBUS.terminate(parseInt(req.params.id));
    res.json({ success: true, message: 'Hợp đồng đã kết thúc' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    await HopDongBUS.addGroupMembers(parseInt(req.params.id), req.body.members || []);
    res.json({ success: true, message: 'Đã thêm thành viên nhóm' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
