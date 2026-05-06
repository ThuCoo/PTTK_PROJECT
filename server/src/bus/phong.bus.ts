import * as PhongDAO from '../dao/phong.dao';

export async function getAll(khuVuc?: string, trangThai?: string, search?: string) {
  return PhongDAO.getAll(khuVuc, trangThai, search);
}

export async function getById(id: string) {
  const p = await PhongDAO.getById(id);
  if (!p) throw new Error('Không tìm thấy phòng');
  return p;
}

export async function findPhongPhuHop(maPhieuDK: string) {
  return PhongDAO.findPhongPhuHop(maPhieuDK);
}

export async function getStats() {
  return PhongDAO.getStats();
}
