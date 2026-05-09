import * as ThanhToanDAO from "../dao/thanhToan.dao";
import * as HopDongDAO from "../dao/hopDong.dao";
import { generateNextCode } from "../utils/generateCode";

export async function getAll(search?: string, trangThai?: string) {
  // Auto-mark overdue invoices on each list query
  await ThanhToanDAO.markOverdue();
  return ThanhToanDAO.getAll(search, trangThai);
}

export async function getById(id: number) {
  const tt = await ThanhToanDAO.getById(id);
  if (!tt) throw new Error("Không tìm thấy phiếu thanh toán");
  return tt;
}

export async function create(data: {
  hop_dong_id: number;
  thang: string;
  tien_dien: number;
  tien_nuoc: number;
  phi_xe: number;
  han_thanh_toan?: string;
}) {
  const hd = await HopDongDAO.getById(data.hop_dong_id);
  if (!hd) throw new Error("Không tìm thấy hợp đồng");
  if (hd.trang_thai !== "Đang hiệu lực")
    throw new Error("Hợp đồng không đang hiệu lực");

  const tienThue = hd.tong_tien_thue;
  const tongTien = tienThue + data.tien_dien + data.tien_nuoc + data.phi_xe;
  const maPhieu = await generateNextCode("PT", "thanh_toan", "ma_phieu");

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

export async function markPaid(id: number, phuongThuc: string) {
  const tt = await ThanhToanDAO.getById(id);
  if (!tt) throw new Error("Không tìm thấy phiếu thanh toán");
  if (tt.trang_thai === "Đã thanh toán")
    throw new Error("Phiếu đã thanh toán rồi");
  if (!phuongThuc) throw new Error("Phương thức thanh toán là bắt buộc");
  await ThanhToanDAO.markPaid(id, phuongThuc);
}

export async function getUnpaidByContract(hopDongId: number) {
  return ThanhToanDAO.getUnpaidByContract(hopDongId);
}

export async function getStats() {
  return ThanhToanDAO.getStats();
}