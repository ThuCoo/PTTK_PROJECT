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
const KhachHangDAO = __importStar(require("../dao/khachHang.dao"));
const PhongDAO = __importStar(require("../dao/phong.dao"));
const ThanhToanDAO = __importStar(require("../dao/thanhToan.dao"));
const LichXemPhongDAO = __importStar(require("../dao/lichXemPhong.dao"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', async (_req, res) => {
    try {
        const [phongStats, khachCount, thanhToanStats, todayAppointments, recentActivity] = await Promise.all([
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
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
