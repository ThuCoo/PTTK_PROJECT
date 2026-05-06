import * as PhongDAO from '../dao/phong.dao';

export async function getAll(khuVuc?: string, trangThai?: string, search?: string) {
  return PhongDAO.getAll(khuVuc, trangThai, search);
}

export async function getById(id: number) {
  const p = await PhongDAO.getById(id);
  if (!p) throw new Error('Không tìm thấy phòng');
  return p;
}

export async function getStats() {
  return PhongDAO.getStats();
}

export function computeStatus(occupied: number, capacity: number): string {
  if (occupied === 0) return 'Trống';
  if (occupied >= capacity) return 'Đang sử dụng';
  return 'Còn giường';
}
