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
exports.getPendingForReview = getPendingForReview;
exports.getFormDetails = getFormDetails;
exports.validateCustomerConditions = validateCustomerConditions;
exports.checkRoomAvailability = checkRoomAvailability;
exports.confirmReview = confirmReview;
exports.handleValidationFailure = handleValidationFailure;
exports.completeReview = completeReview;
const DangKyThueDAO = __importStar(require("../dao/dangKyThue.dao"));
/**
 * Step 1: Get list of pending rental registration forms for review
 * System displays screen MH_DKPhong with list of selected rooms
 */
async function getPendingForReview() {
    const pending = await DangKyThueDAO.getPendingForReview();
    if (!pending || pending.length === 0) {
        return [];
    }
    // Enhance with room info for each form
    const formsWithRooms = await Promise.all(pending.map(async (form) => {
        const rooms = await DangKyThueDAO.getSelectedRooms(form.id);
        return {
            ...form,
            selected_rooms: rooms,
            room_count: rooms.length,
        };
    }));
    return formsWithRooms;
}
/**
 * Step 2: Get form details when user selects a registration form
 */
async function getFormDetails(phieuDangKyId) {
    const form = await DangKyThueDAO.getById(phieuDangKyId);
    if (!form) {
        throw new Error("Không tìm thấy phiếu đăng ký thuê");
    }
    const rooms = await DangKyThueDAO.getSelectedRooms(phieuDangKyId);
    const customerInfo = await DangKyThueDAO.getCustomer(form.khach_hang_id);
    return {
        form,
        customer: customerInfo,
        selected_rooms: rooms,
    };
}
/**
 * Step 3: Validate tenant information against residence conditions
 * Checks if customer meets all conditions required by the selected room
 * Returns validation result with detailed condition checks
 *
 * Alternative Flow A3: Invalid information → throws error
 */
async function validateCustomerConditions(customerId, roomId) {
    // Get customer info
    const customer = await DangKyThueDAO.getCustomer(customerId);
    if (!customer) {
        throw new Error("Không tìm thấy thông tin khách hàng (A3)");
    }
    // Check basic required info
    if (!customer.cccd) {
        throw new Error("Khách hàng chưa cung cấp CCCD/Hộ chiếu hợp lệ (A3: Thông tin không hợp lệ)");
    }
    // Check all conditions for this room
    const conditionCheck = await DangKyThueDAO.checkCustomerConditions(customerId, roomId);
    // Find any failed conditions
    const failedConditions = conditionCheck.conditions.filter((c) => c.trang_thai_khach === "Không hợp lệ");
    if (failedConditions.length > 0) {
        const failureReasons = failedConditions
            .map((c) => `${c.ten_dieu_kien}: ${c.ghi_chu_khach}`)
            .join("; ");
        throw new Error(`Khách hàng không đạt điều kiện lưu trú (A3): ${failureReasons}`);
    }
    // Check if all conditions are reviewed/passed
    const unCheckedConditions = conditionCheck.conditions.filter((c) => c.trang_thai_khach === "Chưa kiểm tra");
    if (unCheckedConditions.length > 0) {
        throw new Error(`Chưa kiểm tra hết điều kiện: ${unCheckedConditions.map((c) => c.ten_dieu_kien).join(", ")} (A3)`);
    }
    return {
        customer_id: customerId,
        customer_name: customer.ho_ten,
        room_id: roomId,
        conditions_checked: conditionCheck.conditions,
        all_conditions_met: conditionCheck.all_passed,
    };
}
/**
 * Step 4: Check room availability and status
 * System requests room condition check
 *
 * Alternative Flow A4: Room unavailable → throws error
 */
async function checkRoomAvailability(roomId) {
    const roomStatus = await DangKyThueDAO.getRoomStatus(roomId);
    if (!roomStatus) {
        throw new Error("Không tìm thấy thông tin phòng");
    }
    // Check availability
    const isAvailable = await DangKyThueDAO.isRoomAvailable(roomId);
    if (!isAvailable) {
        throw new Error(`Phòng ${roomStatus.ma_phong} không khả dụng (A4: Trạng thái = ${roomStatus.trang_thai}). Vui lòng chọn phòng khác.`);
    }
    return {
        room_id: roomId,
        ma_phong: roomStatus.ma_phong,
        loai_phong: roomStatus.loai_phong,
        suc_chua: roomStatus.suc_chua,
        dang_o: roomStatus.dang_o,
        gia_thue: roomStatus.gia_thue,
        trang_thai: roomStatus.trang_thai,
        available: true,
    };
}
/**
 * Step 5: Record selected room assignment for this rental registration
 * Marks form as reviewed and stores the confirmed room
 *
 * Alternative Flow A5: System error → throws error (system will catch and show error message)
 */
async function confirmReview(phieuDangKyId, selectedRoomId, ghiChu) {
    // Validate inputs
    if (!phieuDangKyId || !selectedRoomId) {
        throw new Error("Lỗi hệ thống: Thông tin không hợp lệ (A5)");
    }
    try {
        // Final validation: ensure selected room is in the form's room list
        const form = await DangKyThueDAO.getById(phieuDangKyId);
        if (!form) {
            throw new Error("Lỗi hệ thống: Không tìm thấy phiếu đăng ký (A5)");
        }
        const selectedRooms = await DangKyThueDAO.getSelectedRooms(phieuDangKyId);
        const roomExists = selectedRooms.some((r) => r.id === selectedRoomId);
        if (!roomExists) {
            throw new Error("Lỗi hệ thống: Phòng được chọn không thuộc danh sách (A5)");
        }
        // Record the confirmation
        const result = await DangKyThueDAO.confirmReview(phieuDangKyId, selectedRoomId, ghiChu);
        if (!result) {
            throw new Error("Lỗi hệ thống: Không ghi nhận được thông tin (A5)");
        }
        // Step 6: End UC - return success with recorded data
        return {
            success: true,
            message: "Đã ghi nhận thông tin phòng thành công",
            phieu_dang_ky_id: result.id,
            phong_id_confirmed: result.phong_id_confirmed,
            trang_thai_xem_xet: result.trang_thai_xem_xet,
            ngay_xem_xet: result.ngay_xem_xet,
        };
    }
    catch (error) {
        // A5: System error handling
        throw new Error(`Lỗi hệ thống: ${error.message} (A5)`);
    }
}
/**
 * Handle condition validation failure (A3)
 * Mark form as invalid and record reason
 */
async function handleValidationFailure(phieuDangKyId, reason) {
    try {
        const result = await DangKyThueDAO.markAsInvalid(phieuDangKyId, reason);
        return {
            success: true,
            message: `Đã ghi nhận lỗi: ${reason}`,
            phieu_dang_ky_id: result.id,
            trang_thai: result.trang_thai,
            trang_thai_xem_xet: result.trang_thai_xem_xet,
        };
    }
    catch (error) {
        throw new Error(`Không thể xử lý lỗi: ${error.message}`);
    }
}
/**
 * Complete pre-rental review workflow
 * Orchestrates all 6 steps + error handling
 */
async function completeReview(phieuDangKyId, selectedRoomId) {
    try {
        // Step 2: Get form details
        const formDetails = await getFormDetails(phieuDangKyId);
        // Step 3: Validate customer conditions
        const conditionValidation = await validateCustomerConditions(formDetails.customer.id, selectedRoomId);
        // Step 4: Check room availability
        const roomCheck = await checkRoomAvailability(selectedRoomId);
        // Step 5: Record selection
        const confirmation = await confirmReview(phieuDangKyId, selectedRoomId, "Duyệt từ quy trình rà soát điều kiện");
        return {
            success: true,
            form: formDetails.form,
            customer: formDetails.customer,
            conditions_validation: conditionValidation,
            room_check: roomCheck,
            confirmation: confirmation,
        };
    }
    catch (error) {
        const errorMessage = error.message;
        // Determine error type and handle accordingly
        if (errorMessage.includes("(A3)")) {
            // A3: Invalid information
            await handleValidationFailure(phieuDangKyId, errorMessage);
            throw new Error(`A3 - Thông tin không hợp lệ: ${errorMessage.split("(A3)")[0].trim()}`);
        }
        else if (errorMessage.includes("(A4)")) {
            // A4: Room unavailable - return to step 2
            throw new Error(`A4 - Phòng không khả dụng: ${errorMessage.split("(A4)")[0].trim()} Vui lòng chọn phòng khác.`);
        }
        else if (errorMessage.includes("(A5)")) {
            // A5: System error
            throw new Error(`A5 - Lỗi hệ thống: ${errorMessage}`);
        }
        throw error;
    }
}
