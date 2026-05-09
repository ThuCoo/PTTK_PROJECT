"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const khachHang_routes_1 = __importDefault(require("./routes/khachHang.routes"));
const phong_routes_1 = __importDefault(require("./routes/phong.routes"));
const lichXemPhong_routes_1 = __importDefault(require("./routes/lichXemPhong.routes"));
const hoaDonCoc_routes_1 = __importDefault(require("./routes/hoaDonCoc.routes"));
const hopDong_routes_1 = __importDefault(require("./routes/hopDong.routes"));
const thanhToan_routes_1 = __importDefault(require("./routes/thanhToan.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const dangKyThue_routes_1 = __importDefault(require("./routes/dangKyThue.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/khach-hang", khachHang_routes_1.default);
app.use("/api/phong", phong_routes_1.default);
app.use("/api/lich-xem-phong", lichXemPhong_routes_1.default);
app.use("/api/dat-coc", hoaDonCoc_routes_1.default);
app.use("/api/hop-dong", hopDong_routes_1.default);
app.use("/api/thanh-toan", thanhToan_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/dang-ky-thue", dangKyThue_routes_1.default);
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ nội bộ" });
});
app.listen(PORT, () => {
    console.log(`✅ HomeStay Dorm API running on http://localhost:${PORT}`);
    console.log(`   GUI → BUS → DAO architecture ready`);
});
exports.default = app;
