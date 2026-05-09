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
exports.uploadProof = uploadProof;
exports.confirm = confirm;
exports.reject = reject;
exports.refund = refund;
exports.getStats = getStats;
exports.getProofImage = getProofImage;
exports.getAllPhieuDangKy = getAllPhieuDangKy;
const HoaDonCocDAO = __importStar(require("../dao/hoaDonCoc.dao"));
const generateCode_1 = require("../utils/generateCode");
const encrypt_1 = require("../utils/encrypt");
const db_1 = require("../db");
async function syncOverdueDeposits() {
    const expired = await HoaDonCocDAO.markOverdue();
    // For each expired, we should free up the room
    for (const item of expired) {
        // Find MaPhong from HoaDonCoc -> PhieuDangKy -> PhieuDangKy_Phong
        const result = await (0, db_1.query)(`
      SELECT pkp.MaPhong 
      FROM HoaDonCoc h
      JOIN PhieuDangKy_Phong pkp ON h.MaPhieuDK = pkp.MaPhieuDK
      WHERE h.MaHoaDon = $1
    `, [item.id]);
        if (result.rows[0]) {
            await (0, db_1.query)(`UPDATE Phong SET TrangThai='Trống' WHERE MaPhong=$1`, [result.rows[0].maphong]);
        }
    }
}
async function getAll(search, trangThai) {
    await syncOverdueDeposits();
    return HoaDonCocDAO.getAll(search, trangThai);
}
async function getById(id) {
    await syncOverdueDeposits();
    const d = await HoaDonCocDAO.getById(id);
    if (!d)
        throw new Error("Không tìm thấy phiếu đặt cọc");
    return d;
}
async function create(maPhieuDK, soTien) {
    // Validate PhieuDangKy exists
    const pdkRes = await (0, db_1.query)(`SELECT * FROM PhieuDangKy WHERE MaPhieuDK=$1`, [maPhieuDK]);
    if (!pdkRes.rows[0])
        throw new Error("Phiếu đăng ký không tồn tại");
    const maHoaDon = await (0, generateCode_1.generateNextCode)("HD", "HoaDonCoc", "MaHoaDon");
    const deposit = await HoaDonCocDAO.create({
        ma_hoa_don: maHoaDon,
        ma_phieu_dk: maPhieuDK,
        so_tien: soTien,
    });
    // Temporarily hold the room status
    const roomRes = await (0, db_1.query)(`SELECT MaPhong FROM PhieuDangKy_Phong WHERE MaPhieuDK=$1`, [maPhieuDK]);
    if (roomRes.rows[0]) {
        await (0, db_1.query)(`UPDATE Phong SET TrangThai='Đã cọc' WHERE MaPhong=$1`, [roomRes.rows[0].maphong]);
    }
    // Update PhieuDangKy status
    await (0, db_1.query)(`UPDATE PhieuDangKy SET TrangThai='Đã tạo cọc' WHERE MaPhieuDK=$1`, [maPhieuDK]);
    return deposit;
}
async function uploadProof(id, fileBuffer, mimeType, phuongThuc) {
    await syncOverdueDeposits();
    const deposit = await HoaDonCocDAO.getById(id);
    if (!deposit)
        throw new Error("Không tìm thấy phiếu đặt cọc");
    if ([
        "Đã xác nhận",
        "Hoàn tiền",
        "Quá hạn thanh toán",
        "Đã hủy (quá hạn)",
    ].includes(deposit.trang_thai)) {
        throw new Error("Phiếu đặt cọc đã kết thúc");
    }
    if (deposit.trang_thai !== "Chờ thanh toán" &&
        deposit.trang_thai !== "Không hợp lệ") {
        throw new Error("Phiếu đặt cọc chưa ở trạng thái có thể gửi chứng từ");
    }
    const encrypted = (0, encrypt_1.encryptBuffer)(fileBuffer);
    await HoaDonCocDAO.uploadProof(id, encrypted, mimeType, phuongThuc);
}
async function confirm(id, nguoiXacNhan) {
    const deposit = await HoaDonCocDAO.getById(id);
    if (!deposit)
        throw new Error("Không tìm thấy phiếu đặt cọc");
    if (deposit.trang_thai !== "Đang xử lý" &&
        deposit.trang_thai !== "Chờ xác nhận") {
        throw new Error('Chỉ có thể xác nhận phiếu ở trạng thái "Đang xử lý"');
    }
    await HoaDonCocDAO.confirm(id, nguoiXacNhan);
    // Fix Use Case Logic: Update room status properly upon confirmation
    if (deposit.ma_phong) {
        // If bed tracking was implemented here, we would update DangO.
        // For now, confirm room status is "Đã cọc" (or maybe "Đã thuê" depending on logic)
        await (0, db_1.query)(`UPDATE Phong SET TrangThai='Đã cọc' WHERE MaPhong=$1`, [deposit.ma_phong]);
    }
}
async function reject(id, ghiChu) {
    const deposit = await HoaDonCocDAO.getById(id);
    if (!deposit)
        throw new Error("Không tìm thấy phiếu đặt cọc");
    if (!["Đang xử lý", "Chờ xác nhận", "Không hợp lệ"].includes(deposit.trang_thai)) {
        throw new Error("Phiếu đặt cọc không ở trạng thái cần kiểm tra");
    }
    await HoaDonCocDAO.reject(id, ghiChu);
}
async function refund(id, ghiChu) {
    const deposit = await HoaDonCocDAO.getById(id);
    if (!deposit)
        throw new Error("Không tìm thấy phiếu đặt cọc");
    if ([
        "Đã xác nhận",
        "Hoàn tiền",
        "Quá hạn thanh toán",
        "Đã hủy (quá hạn)",
    ].includes(deposit.trang_thai)) {
        throw new Error("Phiếu đặt cọc đã kết thúc");
    }
    await HoaDonCocDAO.refund(id, ghiChu);
    if (deposit.ma_phong) {
        await (0, db_1.query)(`UPDATE Phong SET TrangThai='Trống' WHERE MaPhong=$1`, [deposit.ma_phong]);
    }
    // Revert customer status if needed
}
async function getStats() {
    await syncOverdueDeposits();
    return HoaDonCocDAO.getStats();
}
/** Returns decrypted image as base64 string */
async function getProofImage(id) {
    const deposit = await HoaDonCocDAO.getById(id);
    if (!deposit?.anh_chung_tu_encrypted)
        return null;
    const { decryptToBase64 } = await Promise.resolve().then(() => __importStar(require("../utils/encrypt")));
    const base64 = decryptToBase64(deposit.anh_chung_tu_encrypted);
    return { base64, mimeType: deposit.mime_type || "image/jpeg" };
}
async function getAllPhieuDangKy() {
    return HoaDonCocDAO.getAllPhieuDangKy();
}
