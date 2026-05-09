import * as KhachHangDAO from '../dao/khachHang.dao';
import { generateNextCode } from '../utils/generateCode';
import { KhachHang } from '../types';

export async function getAll(search?: string, trangThai?: string) {
  return KhachHangDAO.getAll(search, trangThai);
}

export async function getById(maKhachHang: string) {
  const kh = await KhachHangDAO.getById(maKhachHang);
  if (!kh) throw new Error('Không tìm thấy khách hàng');
  return kh;
}

export async function create(data: Omit<KhachHang, 'created_at'>) {
  if (!data.ho_ten?.trim()) throw new Error('Họ và tên là bắt buộc');
  if (!data.sdt?.trim()) throw new Error('Số điện thoại là bắt buộc');
  if (!data.gioi_tinh) throw new Error('Giới tính là bắt buộc');

  const maKhachHang = await generateNextCode('KH', 'khach_hang', 'ma_khach_hang');
  return KhachHangDAO.create({
    ...data,
    ma_khach_hang: maKhachHang,
    trang_thai: data.trang_thai || 'Đang tư vấn',
  });
}

export async function update(maKhachHang: string, data: Partial<KhachHang>) {
  const existing = await KhachHangDAO.getById(maKhachHang);
  if (!existing) throw new Error('Không tìm thấy khách hàng');
  return KhachHangDAO.update(maKhachHang, data);
}

export async function updateStatus(maKhachHang: string, trangThai: string) {
  const validStatuses = [
    'Đang tư vấn', 'Đã lên lịch xem phòng', 'Đồng ý thuê',
    'Chưa quyết định', 'Không tiếp tục thuê', 'Cần tư vấn lại'
  ];
  if (!validStatuses.includes(trangThai)) {
    throw new Error(`Trạng thái không hợp lệ: ${trangThai}`);
  }
  await KhachHangDAO.updateStatus(maKhachHang, trangThai);
}
