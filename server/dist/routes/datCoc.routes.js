"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DatCocBUS = __importStar(require("../bus/datCoc.bus"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/", async (req, res) => {
    try {
        const { search, trang_thai } = req.query;
        const data = await DatCocBUS.getAll(search, trang_thai);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get("/stats", async (_req, res) => {
    try {
        res.json({ success: true, data: await DatCocBUS.getStats() });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        const data = await DatCocBUS.searchByCodeOrPhone(q);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const data = await DatCocBUS.getById(req.params.id);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});
// Get decrypted proof image for a deposit
router.get("/:id/proof", async (req, res) => {
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.post("/", async (req, res) => {
    try {
        const { khach_hang_id, phong_id, so_giuong } = req.body;
        const data = await DatCocBUS.create(parseInt(khach_hang_id), parseInt(phong_id), parseInt(so_giuong));
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Upload proof image — image is encrypted by BUS before DB storage
router.post("/:id/upload", upload_1.upload.single("proof"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: "Chưa chọn file ảnh" });
            return;
        }
        const phuongThuc = req.body.phuong_thuc || "Chuyển khoản";
        await DatCocBUS.uploadProof(parseInt(req.params.id), req.file.buffer, req.file.mimetype, phuongThuc);
        res.json({
            success: true,
            message: "Đã tải lên chứng từ thành công. Quản lý sẽ xác nhận sớm.",
        });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Confirm deposit (quan_ly only)
router.post("/:id/confirm", auth_1.requireQl, async (req, res) => {
    try {
        const nguoiXacNhan = `${req.user.role === "quan_ly" ? "Quản lý" : "NV"} - ${req.user.username}`;
        await DatCocBUS.confirm(req.params.id, nguoiXacNhan);
        res.json({ success: true, message: "Xác nhận đặt cọc thành công" });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// Reject deposit proof (quan_ly only)
router.post("/:id/reject", auth_1.requireQl, async (req, res) => {
    try {
        await DatCocBUS.reject(req.params.id, req.body.ghi_chu || "");
        res.json({
            success: true,
            message: "Đã từ chối. Khách hàng cần thanh toán lại.",
        });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
router.post("/:id/refund", auth_1.requireQl, async (req, res) => {
    try {
        await DatCocBUS.refund(parseInt(req.params.id), req.body.ghi_chu || "Lỗi hệ thống");
        res.json({
            success: true,
            message: "Đã hoàn tiền và kết thúc phiếu đặt cọc",
        });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.default = router;
