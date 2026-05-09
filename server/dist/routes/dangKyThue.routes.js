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
const DangKyThueBUS = __importStar(require("../bus/dangKyThue.bus"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
/**
 * Step 1: Get list of pending rental registration forms for review
 * GET /api/dang-ky-thue/pending
 */
router.get("/pending", async (_req, res) => {
    try {
        const pendingForms = await DangKyThueBUS.getPendingForReview();
        res.json({
            success: true,
            message: "Danh sách phiếu đăng ký chờ duyệt",
            data: pendingForms,
            count: pendingForms.length,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || "Lỗi khi lấy danh sách phiếu đăng ký",
        });
    }
});
/**
 * Step 2: Get rental registration form details
 * GET /api/dang-ky-thue/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const phieuDangKyId = parseInt(req.params.id);
        const formDetails = await DangKyThueBUS.getFormDetails(phieuDangKyId);
        res.json({
            success: true,
            message: "Chi tiết phiếu đăng ký thuê",
            data: formDetails,
        });
    }
    catch (err) {
        res.status(404).json({
            success: false,
            error: err.message || "Không tìm thấy phiếu đăng ký",
        });
    }
});
/**
 * Step 3: Validate customer conditions against room requirements
 * POST /api/dang-ky-thue/:id/validate-conditions
 *
 * Body: { room_id: number }
 *
 * Returns:
 * - 200: Conditions are valid
 * - 400: A3 - Thông tin không hợp lệ
 */
router.post("/:id/validate-conditions", async (req, res) => {
    try {
        const phieuDangKyId = parseInt(req.params.id);
        const { room_id, khach_hang_id } = req.body;
        if (!room_id) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng chọn phòng",
            });
        }
        // Get customer ID from form if not provided
        let customerId = khach_hang_id;
        if (!customerId) {
            const formDetails = await DangKyThueBUS.getFormDetails(phieuDangKyId);
            customerId = formDetails.customer.id;
        }
        const validationResult = await DangKyThueBUS.validateCustomerConditions(customerId, room_id);
        res.json({
            success: true,
            message: "Đối chiếu điều kiện lưu trú thành công",
            data: validationResult,
            step: 3,
        });
    }
    catch (err) {
        const errorMsg = err.message || "Lỗi khi đối chiếu điều kiện";
        if (errorMsg.includes("(A3)")) {
            return res.status(400).json({
                success: false,
                error: errorMsg,
                code: "A3",
                message: "Thông tin không hợp lệ",
            });
        }
        res.status(400).json({
            success: false,
            error: errorMsg,
        });
    }
});
/**
 * Step 4: Check room availability
 * POST /api/dang-ky-thue/:id/check-room/:roomId
 *
 * Returns:
 * - 200: Room is available
 * - 400: A4 - Phòng không khả dụng
 */
router.post("/:id/check-room/:roomId", async (req, res) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const roomCheck = await DangKyThueBUS.checkRoomAvailability(roomId);
        res.json({
            success: true,
            message: "Kiểm tra tình trạng phòng thành công",
            data: roomCheck,
            step: 4,
        });
    }
    catch (err) {
        const errorMsg = err.message || "Lỗi khi kiểm tra tình trạng phòng";
        if (errorMsg.includes("(A4)")) {
            return res.status(400).json({
                success: false,
                error: errorMsg,
                code: "A4",
                message: "Phòng không khả dụng",
                action: "return_to_step_2",
            });
        }
        res.status(400).json({
            success: false,
            error: errorMsg,
        });
    }
});
/**
 * Step 5: Record room assignment for this rental registration
 * Confirm pre-rental review and mark as completed
 * POST /api/dang-ky-thue/:id/confirm-review
 *
 * Body: { room_id: number, ghi_chu?: string }
 *
 * Returns:
 * - 200: Review confirmed and recorded
 * - 400: A5 - Lỗi hệ thống
 */
router.post("/:id/confirm-review", async (req, res) => {
    try {
        const phieuDangKyId = parseInt(req.params.id);
        const { room_id, ghi_chu } = req.body;
        if (!room_id) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng chọn phòng để ghi nhận",
            });
        }
        const confirmation = await DangKyThueBUS.confirmReview(phieuDangKyId, room_id, ghi_chu);
        res.json({
            success: true,
            message: "Đã ghi nhận thông tin phòng thành công",
            data: confirmation,
            step: "6 - Kết thúc UC",
        });
    }
    catch (err) {
        const errorMsg = err.message || "Lỗi khi ghi nhận thông tin";
        if (errorMsg.includes("(A5)")) {
            return res.status(500).json({
                success: false,
                error: "Lỗi hệ thống",
                details: errorMsg,
                code: "A5",
                message: "Hệ thống không ghi nhận được thông tin, vui lòng thử lại",
            });
        }
        res.status(400).json({
            success: false,
            error: errorMsg,
        });
    }
});
/**
 * Complete full workflow: Validate conditions → Check room → Confirm review
 * POST /api/dang-ky-thue/:id/complete-review
 *
 * Body: { room_id: number, ghi_chu?: string }
 *
 * Returns all steps results or appropriate error
 */
router.post("/:id/complete-review", async (req, res) => {
    try {
        const phieuDangKyId = parseInt(req.params.id);
        const { room_id } = req.body;
        if (!room_id) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng chọn phòng",
            });
        }
        const result = await DangKyThueBUS.completeReview(phieuDangKyId, room_id);
        res.json({
            success: true,
            message: "Hoàn tất quy trình rà soát điều kiện",
            data: result,
        });
    }
    catch (err) {
        const errorMsg = err.message || "Lỗi khi hoàn tất quy trình";
        if (errorMsg.includes("A3")) {
            return res.status(400).json({
                success: false,
                error: errorMsg,
                code: "A3",
                action: "end_uc",
            });
        }
        else if (errorMsg.includes("A4")) {
            return res.status(400).json({
                success: false,
                error: errorMsg,
                code: "A4",
                action: "return_to_step_2",
            });
        }
        else if (errorMsg.includes("A5")) {
            return res.status(500).json({
                success: false,
                error: "Lỗi hệ thống",
                details: errorMsg,
                code: "A5",
                action: "end_uc",
            });
        }
        res.status(400).json({
            success: false,
            error: errorMsg,
        });
    }
});
exports.default = router;
