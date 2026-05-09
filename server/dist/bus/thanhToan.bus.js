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
exports.markPaid = markPaid;
exports.getUnpaidByContract = getUnpaidByContract;
exports.getStats = getStats;
const ThanhToanDAO = __importStar(require("../dao/thanhToan.dao"));
const HopDongDAO = __importStar(require("../dao/hopDong.dao"));
const generateCode_1 = require("../utils/generateCode");
async function getAll(search, trangThai) {
    // Auto-mark overdue invoices on each list query
    await ThanhToanDAO.markOverdue();
    return ThanhToanDAO.getAll(search, trangThai);
}
async function getById(id) {
    const tt = await ThanhToanDAO.getById(id);
    if (!tt)
        throw new Error("Không tìm thấy phiếu thanh toán");
    return tt;
}
async function create(data) {
    const hd = await HopDongDAO.getById(data.hop_dong_id);
    if (!hd)
        throw new Error("Không tìm thấy hợp đồng");
    if (hd.trang_thai !== "Đang hiệu lực")
        throw new Error("Hợp đồng không đang hiệu lực");
    const tienThue = hd.tong_tien_thue;
    const tongTien = tienThue + data.tien_dien + data.tien_nuoc + data.phi_xe;
    const maPhieu = await (0, generateCode_1.generateNextCode)("PT", "thanh_toan", "ma_phieu");
    return ThanhToanDAO.create({
        ma_phieu: maPhieu,
        hop_dong_id: data.hop_dong_id,
        thang: data.thang,
        tien_thue: tienThue,
        tien_dien: data.tien_dien,
        tien_nuoc: data.tien_nuoc,
        phi_xe: data.phi_xe,
        tong_tien: tongTien,
        han_thanh_toan: data.han_thanh_toan,
    });
}
async function markPaid(id, phuongThuc) {
    const tt = await ThanhToanDAO.getById(id);
    if (!tt)
        throw new Error("Không tìm thấy phiếu thanh toán");
    if (tt.trang_thai === "Đã thanh toán")
        throw new Error("Phiếu đã thanh toán rồi");
    if (!phuongThuc)
        throw new Error("Phương thức thanh toán là bắt buộc");
    await ThanhToanDAO.markPaid(id, phuongThuc);
}
async function getUnpaidByContract(hopDongId) {
    return ThanhToanDAO.getUnpaidByContract(hopDongId);
}
async function getStats() {
    return ThanhToanDAO.getStats();
}
