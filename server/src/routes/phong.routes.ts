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

router.get('/phu-hop/:maPhieuDK', async (req: Request, res: Response) => {
  try {
    const { maPhieuDK } = req.params;
    const data = await PhongBUS.findPhongPhuHop(maPhieuDK);
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

// API cập nhật giường được chọn trong phòng
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { assignedRooms,maPhieu } = req.body;
    
    if (!Array.isArray(assignedRooms)) {
      return res.status(400).json({ success: false, error: 'assignedRooms phải là mảng' });
    }

    const data = await PhongBUS.updateAssignedBeds(maPhieu,req.params.id, assignedRooms);
    res.json({ success: true, data, message: 'Cập nhật giường thành công' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
router.delete('/unassign-bed', async (req: Request, res: Response) => {
  try {
    const { maPhieuDK, maGiuong } = req.body;
    
    // Gọi BUS xử lý việc xóa bảng trung gian + cập nhật trạng thái giường thành 'Trống'
    const result = await PhongBUS.unassignBed(maPhieuDK, maGiuong);
    
    res.json({ success: true, message: 'Hủy chọn giường thành công' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
// Thêm endpoint này vào router
router.post('/assign-whole-room', async (req: Request, res: Response) => {
  try {
    const { maPhieuDK, maPhong } = req.body;
    await PhongBUS.assignWholeRoom(maPhieuDK, maPhong);
    res.json({ success: true, message: `Đã xếp nguyên phòng ${maPhong} thành công!` });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
export default router;
