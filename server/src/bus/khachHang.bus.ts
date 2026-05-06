import * as KhachHangDAO from '../dao/khachHang.dao';
import { generateNextCode } from '../utils/generateCode';
import { KhachHang } from '../types';

export async function getAll(search?: string, trangThai?: string) {
  return KhachHangDAO.getAll(search, trangThai);
}

export async function getById(id: number) {
  const kh = await KhachHangDAO.getById(id);
  if (!kh) throw new Error('Không tìm thấy khách hàng');
  return kh;
}

export async function create(data: Omit<KhachHang, 'id' | 'created_at' | 'ma_phieu'>) {
  if (!data.ho_ten?.trim()) throw new Error('Họ và tên là bắt buộc');
  if (!data.phone?.trim()) throw new Error('Số điện thoại là bắt buộc');
  if (!data.gioi_tinh) throw new Error('Giới tính là bắt buộc');

  const maPhi = await generateNextCode('PDK', 'khach_hang', 'ma_phieu');
  return KhachHangDAO.create({
    ...data,
    ma_phieu: maPhi,
    trang_thai: data.trang_thai || 'Đang tư vấn',
  });
}

export async function update(id: number, data: Partial<KhachHang>) {
  const existing = await KhachHangDAO.getById(id);
  if (!existing) throw new Error('Không tìm thấy khách hàng');
  return KhachHangDAO.update(id, data);
}

export async function updateStatus(id: number, trangThai: string) {
  const validStatuses = [
    'Đang tư vấn', 'Đã lên lịch xem phòng', 'Đồng ý thuê',
    'Chưa quyết định', 'Không tiếp tục thuê', 'Cần tư vấn lại'
  ];
  if (!validStatuses.includes(trangThai)) {
    throw new Error(`Trạng thái không hợp lệ: ${trangThai}`);
  }
  await KhachHangDAO.updateStatus(id, trangThai);
}
