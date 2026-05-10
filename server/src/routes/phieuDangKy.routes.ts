import { Router } from "express";
import * as PhieuDangKyBus from "../bus/phieuDangKy.bus";

const router = Router();

// Lấy danh sách
router.get("/pending-verification", async (req, res) => {
  try {
    const data = await PhieuDangKyBus.getPendingVerification();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cập nhật trạng thái (Bấm Next)
router.patch("/:id/status", async (req, res) => {
  try {
    const { trang_thai } = req.body;
    const data = await PhieuDangKyBus.updateVerificationStatus(req.params.id, trang_thai);
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Từ chối phòng/giường
router.post("/:id/reject-room", async (req, res) => {
  try {
    const { ghi_chu } = req.body;
    const data = await PhieuDangKyBus.rejectAssignedRoom(req.params.id, ghi_chu);
    res.json({ success: true, ...data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post("/:id/complete-verification", async (req, res) => {
  try {
    const data = await PhieuDangKyBus.completeVerification(req.params.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;