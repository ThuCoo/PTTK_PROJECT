import * as ThanhToanDAO from "../dao/thanhToan.dao";
import * as HopDongDAO from "../dao/hopDong.dao";
import { generateNextCode } from "../utils/generateCode";

export async function getAll(search?: string, trangThai?: string) {
  // Auto-mark overdue invoices on each list query
  await ThanhToanDAO.markOverdue();
  return ThanhToanDAO.getAll(search, trangThai);
}

export async function getById(id: string) {
  const tt = await ThanhToanDAO.getById(id);
  if (!tt) throw new Error("Không tìm thấy phiếu thanh toán");
  return tt;
}

export async function create(data: {
  // Adapted to minimal `phieu_thanh_toan` schema. Extra monetary fields are ignored.
  ma_phieu_kt?: string;
  hinh_thuc?: string;
  trang_thai?: string;
  ma_nv_ke_toan?: string;
}) {
  const hd = await HopDongDAO.getById(data.hop_dong_id);
  if (!hd) throw new Error("Không tìm thấy hợp đồng");
  if (hd.trang_thai !== "Đang hiệu lực")
    throw new Error("Hợp đồng không đang hiệu lực");
  // Generate code and create minimal payment record tied to the inspection (ma_phieu_kt) if provided.
  const maPhieu = await generateNextCode(
    "PT",
    "phieu_thanh_toan",
    "ma_phieu_tt",
  );
  return ThanhToanDAO.create({
    ma_phieu_tt: maPhieu,
    ma_phieu_kt: data.ma_phieu_kt,
    hinh_thuc: data.hinh_thuc,
    trang_thai: data.trang_thai || "Chờ thanh toán",
    ma_nv_ke_toan: data.ma_nv_ke_toan,
  });
}

export async function markPaid(id: string, phuongThuc: string) {
  const tt = await ThanhToanDAO.getById(id);
  if (!tt) throw new Error("Không tìm thấy phiếu thanh toán");
  if (tt.trang_thai === "Đã thanh toán")
    throw new Error("Phiếu đã thanh toán rồi");
  if (!phuongThuc) throw new Error("Phương thức thanh toán là bắt buộc");
  await ThanhToanDAO.markPaid(id, phuongThuc);
}

export async function getUnpaidByContract(hopDongId: string) {
  return ThanhToanDAO.getUnpaidByContract(hopDongId);
}

export async function getStats() {
  return ThanhToanDAO.getStats();
}
