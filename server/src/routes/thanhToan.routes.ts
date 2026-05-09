import { Router, Request, Response } from "express";
import * as ThanhToanBUS from "../bus/thanhToan.bus";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, trang_thai } = req.query as Record<string, string>;
    res.json({
      success: true,
      data: await ThanhToanBUS.getAll(search, trang_thai),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await ThanhToanBUS.getStats() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: await ThanhToanBUS.getById(parseInt(req.params.id)),
    });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = await ThanhToanBUS.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get(
  "/contract/:hopDongId/unpaid",
  async (req: Request, res: Response) => {
    try {
      const unpaid = await ThanhToanBUS.getUnpaidByContract(
        parseInt(req.params.hopDongId),
      );
      res.json({ success: true, data: unpaid, hasUnpaid: unpaid.length > 0 });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

export default router;
