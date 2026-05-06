import { Router, Request, Response } from 'express';
import * as KhachHangDAO from '../dao/khachHang.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as DatCocDAO from '../dao/datCoc.dao';
import * as HopDongDAO from '../dao/hopDong.dao';
import * as ThanhToanDAO from '../dao/thanhToan.dao';
import * as LichXemPhongDAO from '../dao/lichXemPhong.dao';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [phongStats, khachCount, thanhToanStats, todayAppointments, recentActivity] =
      await Promise.all([
        PhongDAO.getStats(),
        KhachHangDAO.countAll(),
        ThanhToanDAO.getStats(),
        LichXemPhongDAO.getTodayAppointments(),
        ThanhToanDAO.getRecentActivity(4),
      ]);

    res.json({
      success: true,
      data: {
        tong_khach_hang: khachCount,
        phong_dang_thue: phongStats.dang_thue,
        phong_trong: phongStats.trong,
        doanh_thu_thang: thanhToanStats.da_thu,
        lich_xem_hom_nay: todayAppointments,
        hoat_dong_gan_day: recentActivity,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
