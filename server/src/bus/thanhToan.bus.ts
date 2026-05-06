import * as ThanhToanDAO from '../dao/thanhToan.dao';
import * as HopDongDAO from '../dao/hopDong.dao';
import { generateNextCode } from '../utils/generateCode';

export async function getAll(search?: string, trangThai?: string) {
  // Auto-mark overdue invoices on each list query
  await ThanhToanDAO.markOverdue();
  return ThanhToanDAO.getAll(search, trangThai);
}

export async function getById(id: string) {
  const tt = await ThanhToanDAO.getById(id);
  if (!tt) throw new Error('Không tìm thấy phiếu thanh toán');
  return tt;
}

export async function create(data: {
  MaHopDong: string;
  MaPhieuKT: string;
  MaNVKeToan: string;
  HinhThuc: string;
}) {
  const hd = await HopDongDAO.getById(data.MaHopDong);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  if (hd.TrangThai !== 'Đang hiệu lực') throw new Error('Hợp đồng không đang hiệu lực');

  const maPhieu = await generateNextCode('PTT', 'PhieuThanhToan', 'MaPhieuTT');

  return ThanhToanDAO.create({
    MaPhieuTT: maPhieu,
    MaPhieuKT: data.MaPhieuKT,
    MaNVKeToan: data.MaNVKeToan,
    HinhThuc: data.HinhThuc,
  });
}

export async function markPaid(id: string, phuongThuc: string) {
  const tt = await ThanhToanDAO.getById(id);
  if (!tt) throw new Error('Không tìm thấy phiếu thanh toán');
  if (tt.TrangThai === 'Đã thanh toán') throw new Error('Phiếu đã thanh toán rồi');
  if (!phuongThuc) throw new Error('Phương thức thanh toán là bắt buộc');
  await ThanhToanDAO.markPaid(id, phuongThuc);
}

export async function getStats() {
  return ThanhToanDAO.getStats();
}
