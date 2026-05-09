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
exports.update = update;
exports.updateStatus = updateStatus;
const KhachHangDAO = __importStar(require("../dao/khachHang.dao"));
const generateCode_1 = require("../utils/generateCode");
async function getAll(search, trangThai) {
    return KhachHangDAO.getAll(search, trangThai);
}
async function getById(maKhachHang) {
    const kh = await KhachHangDAO.getById(maKhachHang);
    if (!kh)
        throw new Error('Không tìm thấy khách hàng');
    return kh;
}
async function create(data) {
    if (!data.ho_ten?.trim())
        throw new Error('Họ và tên là bắt buộc');
    if (!data.sdt?.trim())
        throw new Error('Số điện thoại là bắt buộc');
    if (!data.gioi_tinh)
        throw new Error('Giới tính là bắt buộc');
    const maKhachHang = await (0, generateCode_1.generateNextCode)('KH', 'khach_hang', 'ma_khach_hang');
    return KhachHangDAO.create({
        ...data,
        ma_khach_hang: maKhachHang,
        trang_thai: data.trang_thai || 'Đang tư vấn',
    });
}
async function update(maKhachHang, data) {
    const existing = await KhachHangDAO.getById(maKhachHang);
    if (!existing)
        throw new Error('Không tìm thấy khách hàng');
    return KhachHangDAO.update(maKhachHang, data);
}
async function updateStatus(maKhachHang, trangThai) {
    const validStatuses = [
        'Đang tư vấn', 'Đã lên lịch xem phòng', 'Đồng ý thuê',
        'Chưa quyết định', 'Không tiếp tục thuê', 'Cần tư vấn lại'
    ];
    if (!validStatuses.includes(trangThai)) {
        throw new Error(`Trạng thái không hợp lệ: ${trangThai}`);
    }
    await KhachHangDAO.updateStatus(maKhachHang, trangThai);
}
