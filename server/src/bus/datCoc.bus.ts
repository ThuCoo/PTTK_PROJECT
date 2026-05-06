import * as DatCocDAO from '../dao/datCoc.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as KhachHangDAO from '../dao/khachHang.dao';
import { generateNextCode } from '../utils/generateCode';

export async function getAll(search?: string, trangThai?: string) {
  return DatCocDAO.getAll(search, trangThai);
}

export async function getById(id: string) {
  const d = await DatCocDAO.getById(id);
  if (!d) throw new Error('Không tìm thấy phiếu đặt cọc');
  return d;
}

export async function searchByCodeOrPhone(query: string) {
  const d = await DatCocDAO.getByMaCoc(query);
  if (!d) throw new Error('Không tìm thấy dữ liệu đặt cọc phù hợp');
  return d;
}

export async function create(maKhachHang: string, maPhong: string, soTienCoc: number, maNVKeToan: string) {
  const phong = await PhongDAO.getByMaPhong(maPhong);
  if (!phong) throw new Error('Phòng không tồn tại');
  if (soTienCoc <= 0) throw new Error('Số tiền cọc phải lớn hơn 0');

  const maCoc = await generateNextCode('HDC', 'HoaDonCoc', 'MaHoaDon');
  const hoaDon = await DatCocDAO.create({
    MaHoaDon: maCoc,
    NgayLap: new Date(),
    SoTienCoc: soTienCoc,
    MaPhieuDK: '', // Will be generated in PhieuDangKy
    MaNVKeToan: maNVKeToan,
  });

  // Update room status to "Đã cọc"
  await PhongDAO.updateStatus(maPhong, 'Đã cọc');

  return hoaDon;
}

export async function uploadProof(id: string, phuongThuc: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  if (deposit.trang_thai === 'Đã xác nhận') throw new Error('Phiếu đặt cọc đã được xác nhận rồi');
  await DatCocDAO.uploadProof(id, phuongThuc);
}

export async function confirm(id: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  if (deposit.trang_thai !== 'Chờ xác nhận') {
    throw new Error('Chỉ có thể xác nhận phiếu ở trạng thái "Chờ xác nhận"');
  }
  await DatCocDAO.confirm(id);
}

export async function reject(id: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  await DatCocDAO.reject(id);
}

export async function cancel(id: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  await DatCocDAO.cancel(id);
}

export async function getStats() {
  return DatCocDAO.getStats();
}
