import * as HopDongDAO from '../dao/hopDong.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as KhachHangDAO from '../dao/khachHang.dao';
import * as DatCocDAO from '../dao/datCoc.dao';
import { generateNextCode } from '../utils/generateCode';
import { ThanhVienNhom } from '../types';

export async function getAll(search?: string, trangThai?: string) {
  return HopDongDAO.getAll(search, trangThai);
}

export async function getById(id: number) {
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  return hd;
}

export async function create(data: {
  khach_hang_id: number;
  phong_id: number;
  so_giuong: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
}) {
  if (!data.ngay_bat_dau || !data.ngay_ket_thuc) throw new Error('Ngày bắt đầu và kết thúc là bắt buộc');
  if (new Date(data.ngay_bat_dau) >= new Date(data.ngay_ket_thuc)) {
    throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
  }

  const phong = await PhongDAO.getById(data.phong_id);
  if (!phong) throw new Error('Phòng không tồn tại');

  // Ensure deposit is confirmed
  const deposits = await DatCocDAO.getAll(undefined, 'Đã xác nhận');
  const hasDeposit = deposits.some(d => d.phong_id === data.phong_id && d.khach_hang_id === data.khach_hang_id);
  if (!hasDeposit) throw new Error('Chưa có đặt cọc được xác nhận cho khách hàng và phòng này');

  const giaThue = phong.gia_thue;
  const tongTien = giaThue * data.so_giuong;
  const tienCoc = tongTien * 2; // 2 months deposit

  const maHd = await generateNextCode('HD', 'hop_dong', 'ma_hd');
  return HopDongDAO.create({
    ma_hd: maHd,
    ...data,
    gia_thue_moi_giuong: giaThue,
    tong_tien_thue: tongTien,
    tien_coc: tienCoc,
  });
}

export async function sign(id: number) {
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  if (hd.trang_thai !== 'Chờ ký') throw new Error('Hợp đồng không ở trạng thái chờ ký');

  await HopDongDAO.sign(id);
  await PhongDAO.incrementOccupied(hd.phong_id, hd.so_giuong);
  const newOccupied = (await PhongDAO.getById(hd.phong_id))!.dang_o;
  const phong = (await PhongDAO.getById(hd.phong_id))!;
  const newStatus = newOccupied >= phong.suc_chua ? 'Đang sử dụng' : 'Còn giường';
  await PhongDAO.updateStatus(hd.phong_id, newStatus);
}

export async function terminate(id: number) {
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  await HopDongDAO.terminate(id);
  await PhongDAO.incrementOccupied(hd.phong_id, -hd.so_giuong);
  const phong = await PhongDAO.getById(hd.phong_id);
  if (phong && phong.dang_o === 0) await PhongDAO.updateStatus(hd.phong_id, 'Trống');
}

export async function addGroupMembers(hopDongId: number, members: ThanhVienNhom[]) {
  if (!members.length) throw new Error('Phải có ít nhất 1 thành viên');
  const hd = await HopDongDAO.getById(hopDongId);
  if (!hd) throw new Error('Không tìm thấy hợp đồng');
  if (members.length > hd.so_giuong) {
    throw new Error(`Số thành viên (${members.length}) vượt quá số giường đã cọc (${hd.so_giuong})`);
  }
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
