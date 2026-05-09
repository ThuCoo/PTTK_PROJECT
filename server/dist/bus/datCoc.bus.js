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
exports.searchByCodeOrPhone = searchByCodeOrPhone;
exports.create = create;
exports.uploadProof = uploadProof;
exports.confirm = confirm;
exports.reject = reject;
exports.refund = refund;
exports.getStats = getStats;
exports.getProofImage = getProofImage;
const DatCocDAO = __importStar(require("../dao/datCoc.dao"));
const PhongDAO = __importStar(require("../dao/phong.dao"));
const KhachHangDAO = __importStar(require("../dao/khachHang.dao"));
const generateCode_1 = require("../utils/generateCode");
const encrypt_1 = require("../utils/encrypt");
async function syncOverdueDeposits() {
    const expired = await DatCocDAO.markOverdue();
    for (const item of expired) {
        await PhongDAO.updateStatus(item.ma_phong, "Trống");
    }
}
async function getAll(search, trangThai) {
    await syncOverdueDeposits();
    return DatCocDAO.getAll(search, trangThai);
}
async function getById(maCoc) {
    await syncOverdueDeposits();
    const d = await DatCocDAO.getById(maCoc);
    if (!d)
        throw new Error("Không tìm thấy phiếiu đặt cọc");
    return d;
}
async function searchByCodeOrPhone(query) {
    await syncOverdueDeposits();
    const d = await DatCocDAO.getByMaCoc(query);
    if (!d)
        throw new Error("Không tìm thấy dữ liệu đặt cọc phù hợp");
    return d;
}
async function create(khachHangId, phongId, soGiuong) {
    const phong = await PhongDAO.getById(phongId);
    if (!phong)
        throw new Error("Phòng không tồn tại");
    if (soGiuong <= 0)
        throw new Error("Số giường phải lớn hơn 0");
    if (soGiuong > phong.suc_chua - phong.dang_o) {
        throw new Error(`Phòng chỉ còn ${phong.suc_chua - phong.dang_o} giường trống`);
    }
    // Business rule: deposit = 2 months × beds × price per bed
    const soTien = 2 * soGiuong * phong.gia_thue;
    const hanThanhToan = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
    const maCoc = await (0, generateCode_1.generateNextCode)("DC", "dat_coc", "ma_coc");
    const deposit = await DatCocDAO.create({
        ma_coc: maCoc,
        khach_hang_id: khachHangId,
        phong_id: phongId,
        so_giuong: soGiuong,
        so_tien: soTien,
        han_thanh_toan: hanThanhToan,
    });
    // Update room status to "Đã cọc"
    await PhongDAO.updateStatus(phongId, "Đã cọc");
    await KhachHangDAO.updateStatus(khachHangId, "Đồng ý thuê");
    return deposit;
}
async function uploadProof(maCoc, fileBuffer, mimeType, phuongThuc) {
    await syncOverdueDeposits();
    const deposit = await DatCocDAO.getById(maCoc);
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
    await DatCocDAO.uploadProof(maCoc, encrypted, mimeType, phuongThuc);
}
async function confirm(maCoc, nguoiXacNhan) {
    const deposit = await DatCocDAO.getById(maCoc);
    if (!deposit)
        throw new Error("Không tìm thấy phiếu đặt cọc");
    if (deposit.trang_thai !== "Đang xử lý" &&
        deposit.trang_thai !== "Chờ xác nhận") {
        throw new Error('Chỉ có thể xác nhận phiếu ở trạng thái "Đang xử lý"');
    }
    await DatCocDAO.confirm(maCoc, nguoiXacNhan);
}
async function reject(maCoc, ghiChu) {
    const deposit = await DatCocDAO.getById(maCoc);
    if (!deposit)
        throw new Error("Không tìm thấy phiếu đặt cọc");
    if (!["Đang xử lý", "Chờ xác nhận", "Không hợp lệ"].includes(deposit.trang_thai)) {
        throw new Error("Phiếu đặt cọc không ở trạng thái cần kiểm tra");
    }
    await DatCocDAO.reject(maCoc, ghiChu);
}
async function refund(maCoc, ghiChu) {
    const deposit = await DatCocDAO.getById(maCoc);
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
    await DatCocDAO.refund(maCoc, ghiChu);
    await PhongDAO.updateStatus(deposit.ma_phong, "Trống");
    await KhachHangDAO.updateStatus(deposit.ma_khach_hang, "Đang tư vấn");
}
async function getStats() {
    await syncOverdueDeposits();
    return DatCocDAO.getStats();
}
/** Returns decrypted image as base64 string */
async function getProofImage(maCoc) {
    const deposit = await DatCocDAO.getById(maCoc);
    if (!deposit?.anh_chung_tu_encrypted)
        return null;
    const { decryptToBase64 } = await Promise.resolve().then(() => __importStar(require("../utils/encrypt")));
    const base64 = decryptToBase64(deposit.anh_chung_tu_encrypted);
    return { base64, mimeType: deposit.mime_type || "image/jpeg" };
}
