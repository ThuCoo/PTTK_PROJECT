import * as HopDongDAO from '../dao/hopDong.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as DatCocDAO from '../dao/datCoc.dao';
import { generateNextCode } from '../utils/generateCode';
import { ThanhVienNhom } from '../types';

export async function getAll(search?: string, trangThai?: string) {
  return HopDongDAO.getAll(search, trangThai);
}

export async function getById(id: string) {
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  return hd;
}

export async function create(data: {
  MaKhachHang: string;
  MaPhieuDK: string;
  MaHoaDon: string;
  NgayNhanPhong: Date;
  KyThanhToan: string;
  TienBanGiao: number;
}) {
  if (!data.NgayNhanPhong) throw new Error('Ngày nhận phòng là bắt buộc');

  // Ensure deposit is confirmed
  const deposit = await DatCocDAO.getById(data.MaHoaDon);
  if (!deposit) throw new Error('Không tìm thấy phiếu cọc');
  if (deposit.TrangThai !== 'Đã xác nhận') {
    throw new Error('Phiếu cọc chưa được xác nhận');
  }

  const maHd = await generateNextCode('HD', 'HopDong', 'MaHopDong');
  return HopDongDAO.create({
    MaHopDong: maHd,
    NgayNhanPhong: data.NgayNhanPhong,
    KyThanhToan: data.KyThanhToan,
    TienBanGiao: data.TienBanGiao,
    MaKhachHang: data.MaKhachHang,
    MaHoaDon: data.MaHoaDon,
  });
}

export async function sign(id: string) {
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  if (hd.TrangThai !== 'Chờ ký') throw new Error('Hợp đồng không ở trạng thái chờ ký');

  await HopDongDAO.sign(id);
}

export async function terminate(id: string) {
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  await HopDongDAO.terminate(id);
}

export async function addGroupMembers(hopDongId: string, members: ThanhVienNhom[]) {
  if (!members.length) throw new Error('Phải có ít nhất 1 thành viên');
  const hd = await HopDongDAO.getById(hopDongId);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  // Check required fields
  for (const m of members) {
    if (!m.ho_ten?.trim()) throw new Error('Họ tên thành viên là bắt buộc');
    if (!m.cccd?.trim()) throw new Error('CCCD thành viên là bắt buộc');
  }
  await HopDongDAO.addGroupMembers(hopDongId, members);
}

export async function getStats() {
  return HopDongDAO.getStats();
}
