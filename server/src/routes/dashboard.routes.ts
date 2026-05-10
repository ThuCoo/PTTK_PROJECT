import { Router, Request, Response } from 'express';
import * as KhachHangDAO from '../dao/khachHang.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as DatCocDAO from '../dao/datCoc.dao';
import * as HopDongDAO from '../dao/hopDong.dao';
import * as ThanhToanDAO from '../dao/thanhToan.dao';
import * as LichXemPhongDAO from '../dao/lichXemPhong.dao';
// import * as DashboardDAO from '../dao/dashboard.dao';
import { authMiddleware } from '../middleware/auth';
import { DashboardDAO } from '../dao/dashboard.dao';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Chỉ gọi đúng 1 hàm, DB lo toàn bộ logic tính toán
    const overviewData = await DashboardDAO.getOverview();

    res.json({
      success: true,
      data: {
        tong_khach_hang: parseInt(overviewData.tong_khach_hang),
        phong_dang_thue: parseInt(overviewData.phong_dang_thue),
        phong_trong: parseInt(overviewData.phong_trong),
        doanh_thu_thang: parseFloat(overviewData.doanh_thu_thang),
        lich_xem_hom_nay: overviewData.lich_xem_hom_nay // Đã là 1 array sẵn
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
export default router;
