import { Router, Request, Response } from 'express';
import * as LichXemPhongDAO from '../dao/lichXemPhong.dao';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { date } = req.query as Record<string, string>;
    res.json({ success: true, data: await LichXemPhongDAO.getAll(date) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/today', async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await LichXemPhongDAO.getTodayAppointments() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = await LichXemPhongDAO.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    await LichXemPhongDAO.updateStatus(parseInt(req.params.id), req.body.trang_thai);
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
