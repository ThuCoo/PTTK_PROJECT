import { Router, Request, Response } from "express";
import * as DatCocBUS from "../bus/datCoc.bus";
import { authMiddleware, requireQl } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, trang_thai } = req.query as Record<string, string>;
    const data = await DatCocBUS.getAll(search, trang_thai);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await DatCocBUS.getStats() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query as Record<string, string>;
    const data = await DatCocBUS.searchByCodeOrPhone(q);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const data = await DatCocBUS.getById(req.params.id);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// Get decrypted proof image for a deposit
router.get("/:id/proof", async (req: Request, res: Response) => {
  try {
    const result = await DatCocBUS.getProofImage(req.params.id);
    if (!result) {
      res.status(404).json({ success: false, error: "Không có ảnh chứng từ" });
      return;
    }
    // Return as data URL
    res.json({
      success: true,
      data: { dataUrl: `data:${result.mimeType};base64,${result.base64}` },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { khach_hang_id, phong_id, so_giuong } = req.body;
    const data = await DatCocBUS.create(
      parseInt(khach_hang_id),
      parseInt(phong_id),
      parseInt(so_giuong),
    );
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Upload proof image — image is encrypted by BUS before DB storage
router.post(
  "/:id/upload",
  upload.single("proof"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: "Chưa chọn file ảnh" });
        return;
      }
      const phuongThuc = req.body.phuong_thuc || "Chuyển khoản";
      await DatCocBUS.uploadProof(
        parseInt(req.params.id),
        req.file.buffer,
        req.file.mimetype,
        phuongThuc,
      );
      res.json({
        success: true,
        message: "Đã tải lên chứng từ thành công. Quản lý sẽ xác nhận sớm.",
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// Confirm deposit (quan_ly only)
router.post("/:id/confirm", requireQl, async (req: Request, res: Response) => {
  try {
    const nguoiXacNhan = `${req.user!.role === "quan_ly" ? "Quản lý" : "NV"} - ${req.user!.username}`;
    await DatCocBUS.confirm(req.params.id, nguoiXacNhan);
    res.json({ success: true, message: "Xác nhận đặt cọc thành công" });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Reject deposit proof (quan_ly only)
router.post("/:id/reject", requireQl, async (req: Request, res: Response) => {
  try {
    await DatCocBUS.reject(req.params.id, req.body.ghi_chu || "");
    res.json({
      success: true,
      message: "Đã từ chối. Khách hàng cần thanh toán lại.",
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post("/:id/refund", requireQl, async (req: Request, res: Response) => {
  try {
    await DatCocBUS.refund(
      parseInt(req.params.id),
      req.body.ghi_chu || "Lỗi hệ thống",
    );
    res.json({
      success: true,
      message: "Đã hoàn tiền và kết thúc phiếu đặt cọc",
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
