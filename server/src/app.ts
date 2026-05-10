import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import khachHangRoutes from "./routes/khachHang.routes";
import phongRoutes from "./routes/phong.routes";
import lichXemPhongRoutes from "./routes/lichXemPhong.routes";
import hoaDonCocRoutes from "./routes/hoaDonCoc.routes";
import hopDongRoutes from "./routes/hopDong.routes";
import thanhToanRoutes from "./routes/thanhToan.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import dangKyThueRoutes from "./routes/dangKyThue.routes";
import datcoc from "./routes/datCoc.routes";
import phieuDangKyRoutes from "./routes/phieuDangKy.routes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/khach-hang", khachHangRoutes);
app.use("/api/phong", phongRoutes);
app.use("/api/lich-xem-phong", lichXemPhongRoutes);
app.use("/api/dat-coc", hoaDonCocRoutes);
app.use("/api/hop-dong", hopDongRoutes);
app.use("/api/thanh-toan", thanhToanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dang-ky-thue", dangKyThueRoutes);
app.use("/api/phieu-dang-ky", phieuDangKyRoutes);


// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
  },
);

app.listen(PORT, () => {
  console.log(`✅ HomeStay Dorm API running on http://localhost:${PORT}`);
  console.log(`   GUI → BUS → DAO architecture ready`);
});

export default app;
