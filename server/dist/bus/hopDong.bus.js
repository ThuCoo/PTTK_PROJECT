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
exports.getAll = getAll;
exports.getById = getById;
exports.create = create;
exports.sign = sign;
exports.terminate = terminate;
exports.addGroupMembers = addGroupMembers;
exports.roomReturn = roomReturn;
exports.getReturnReady = getReturnReady;
exports.getStats = getStats;
const HopDongDAO = __importStar(require("../dao/hopDong.dao"));
const PhongDAO = __importStar(require("../dao/phong.dao"));
const DatCocDAO = __importStar(require("../dao/datCoc.dao"));
const generateCode_1 = require("../utils/generateCode");
async function getAll(search, trangThai) {
    return HopDongDAO.getAll(search, trangThai);
}
async function getById(id) {
    const maHopDong = String(id);
    const hd = await HopDongDAO.getById(maHopDong);
    if (!hd)
        throw new Error("Không tìm thấy hợp đồng");
    return hd;
}
async function create(data) {
    if (!data.ngay_bat_dau || !data.ngay_ket_thuc)
        throw new Error("Ngày bắt đầu và kết thúc là bắt buộc");
    if (new Date(data.ngay_bat_dau) >= new Date(data.ngay_ket_thuc)) {
        throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
    }
    const maPhong = String(data.phong_id);
    const maKhachHang = String(data.khach_hang_id);
    const phong = await PhongDAO.getById(maPhong);
    if (!phong)
        throw new Error("Phòng không tồn tại");
    // Ensure deposit is confirmed
    const deposits = await DatCocDAO.getAll(undefined, "Đã xác nhận");
    const hasDeposit = deposits.some((d) => d.ma_phong === maPhong && d.ma_khach_hang === maKhachHang);
    if (!hasDeposit)
        throw new Error("Chưa có đặt cọc được xác nhận cho khách hàng và phòng này");
    const giaThue = phong.gia_thue_phong || phong.gia_thue || 0;
    const tongTien = giaThue * data.so_giuong;
    const tienCoc = tongTien * 2; // 2 months deposit
    const maHd = await (0, generateCode_1.generateNextCode)("HD", "hop_dong", "ma_hop_dong");
    return HopDongDAO.create({
        ma_hop_dong: maHd,
        ma_khach_hang: maKhachHang,
        ma_phong: maPhong,
        so_giuong: data.so_giuong,
        ngay_bat_dau: data.ngay_bat_dau,
        ngay_ket_thuc: data.ngay_ket_thuc,
        gia_thue_moi_giuong: giaThue,
        tong_tien_thue: tongTien,
        tien_coc: tienCoc,
    });
}
async function sign(id) {
    const maHopDong = String(id);
    const hd = await HopDongDAO.getById(maHopDong);
    if (!hd)
        throw new Error("Không tìm thấy hợp đồng");
    if (hd.trang_thai !== "Chờ ký")
        throw new Error("Hợp đồng không ở trạng thái chờ ký");
    await HopDongDAO.sign(id);
    await PhongDAO.incrementOccupied(hd.phong_id, hd.so_giuong);
    const newOccupied = (await PhongDAO.getById(hd.phong_id)).dang_o;
    const phong = (await PhongDAO.getById(hd.phong_id));
    const newStatus = newOccupied >= phong.suc_chua ? "Đang sử dụng" : "Còn giường";
    await PhongDAO.updateStatus(hd.phong_id, newStatus);
}
async function terminate(id) {
    const hd = await HopDongDAO.getById(id);
    if (!hd)
        throw new Error("Không tìm thấy hợp đồng");
    await HopDongDAO.terminate(id);
    await PhongDAO.incrementOccupied(hd.phong_id, -hd.so_giuong);
    const phong = await PhongDAO.getById(hd.phong_id);
    if (phong && phong.dang_o === 0)
        await PhongDAO.updateStatus(hd.phong_id, "Trống");
}
async function addGroupMembers(hopDongId, members) {
    if (!members.length)
        throw new Error("Phải có ít nhất 1 thành viên");
    const hd = await HopDongDAO.getById(hopDongId);
    if (!hd)
        throw new Error("Không tìm thấy hợp đồng");
    if (members.length > hd.so_giuong) {
        throw new Error(`Số thành viên (${members.length}) vượt quá số giường đã cọc (${hd.so_giuong})`);
    }
    // Check required fields
    for (const m of members) {
        if (!m.ho_ten?.trim())
            throw new Error("Họ tên thành viên là bắt buộc");
        if (!m.cccd?.trim())
            throw new Error("CCCD thành viên là bắt buộc");
    }
    await HopDongDAO.addGroupMembers(hopDongId, members);
}
async function roomReturn(id, roomReportNotes) {
    // Step 1: Verify contract exists
    const hd = await HopDongDAO.getById(id);
    if (!hd)
        throw new Error("Không tìm thấy hợp đồng");
    // Step 2: Verify contract is currently active (Đang hiệu lực)
    if (hd.trang_thai !== "Đang hiệu lực") {
        throw new Error("Hợp đồng không ở trạng thái có thể trả phòng");
    }
    // Step 3: Check if all payments are completed (A1 - payment not completed)
    // For now, we'll use a simple check - in production, this would verify all invoices are paid
    // This is where we would verify: không có phiếu thanh toán nào chưa thanh toán
    // const unpaidPayments = await ThanhToanDAO.getAll(undefined, 'Chưa thanh toán');
    // const hasUnpaidPayments = unpaidPayments.some(p => p.hop_dong_id === id);
    // if (hasUnpaidPayments) {
    //   throw new Error('Chưa hoàn tất thanh toán');
    // }
    // Step 4: Verify room report exists (A2 - no room report)
    if (!roomReportNotes || !roomReportNotes.trim()) {
        throw new Error("Chưa có biên bản trả phòng");
    }
    // Step 5: Update contract status to "Đã thanh lý"
    await HopDongDAO.finalize(id);
    // Step 6: Update room/bed status to "Trống" and record checkout time
    await PhongDAO.incrementOccupied(hd.phong_id, -hd.so_giuong);
    const phong = await PhongDAO.getById(hd.phong_id);
    if (phong && phong.dang_o === 0) {
        await PhongDAO.updateStatus(hd.phong_id, "Trống");
    }
    // Step 7: Record checkout time
    const checkoutTime = new Date().toISOString();
    await HopDongDAO.recordCheckoutTime(id, checkoutTime);
    return {
        success: true,
        message: "Hoàn trả phòng thành công",
        checkoutTime: checkoutTime,
        contractId: id,
    };
}
async function getReturnReady() {
    return HopDongDAO.getByStatus("Đang hiệu lực");
}
async function getStats() {
    return HopDongDAO.getStats();
}
