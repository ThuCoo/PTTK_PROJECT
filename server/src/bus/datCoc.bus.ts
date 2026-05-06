import * as DatCocDAO from '../dao/datCoc.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as KhachHangDAO from '../dao/khachHang.dao';
import { generateNextCode } from '../utils/generateCode';
import { encryptBuffer } from '../utils/encrypt';

export async function getAll(search?: string, trangThai?: string) {
  return DatCocDAO.getAll(search, trangThai);
}

export async function getById(id: number) {
  const d = await DatCocDAO.getById(id);
  if (!d) throw new Error('Không tìm thấy phiếu đặt cọc');
  return d;
}

export async function searchByCodeOrPhone(query: string) {
  const d = await DatCocDAO.getByMaCoc(query);
  if (!d) throw new Error('Không tìm thấy dữ liệu đặt cọc phù hợp');
  return d;
}

export async function create(khachHangId: number, phongId: number, soGiuong: number) {
  const phong = await PhongDAO.getById(phongId);
  if (!phong) throw new Error('Phòng không tồn tại');
  if (soGiuong <= 0) throw new Error('Số giường phải lớn hơn 0');
  if (soGiuong > phong.suc_chua - phong.dang_o) {
    throw new Error(`Phòng chỉ còn ${phong.suc_chua - phong.dang_o} giường trống`);
  }

  // Business rule: deposit = 2 months × beds × price per bed
  const soTien = 2 * soGiuong * phong.gia_thue;
  const hanThanhToan = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours

  const maCoc = await generateNextCode('DC', 'dat_coc', 'ma_coc');
  const deposit = await DatCocDAO.create({ ma_coc: maCoc, khach_hang_id: khachHangId, phong_id: phongId, so_giuong: soGiuong, so_tien: soTien, han_thanh_toan: hanThanhToan });

  // Update room status to "Đã cọc"
  await PhongDAO.updateStatus(phongId, 'Đã cọc');
  await KhachHangDAO.updateStatus(khachHangId, 'Đồng ý thuê');

  return deposit;
}

export async function uploadProof(id: number, fileBuffer: Buffer, mimeType: string, phuongThuc: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  if (deposit.trang_thai === 'Đã xác nhận') throw new Error('Phiếu đặt cọc đã được xác nhận rồi');

  const encrypted = encryptBuffer(fileBuffer);
  await DatCocDAO.uploadProof(id, encrypted, mimeType, phuongThuc);
}

export async function confirm(id: number, nguoiXacNhan: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  if (deposit.trang_thai !== 'Chờ xác nhận') {
    throw new Error('Chỉ có thể xác nhận phiếu ở trạng thái "Chờ xác nhận"');
  }
  await DatCocDAO.confirm(id, nguoiXacNhan);
}

export async function reject(id: number, ghiChu: string) {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit) throw new Error('Không tìm thấy phiếu đặt cọc');
  await DatCocDAO.reject(id, ghiChu);
}

export async function getStats() {
  return DatCocDAO.getStats();
}

/** Returns decrypted image as base64 string */
export async function getProofImage(id: number): Promise<{ base64: string; mimeType: string } | null> {
  const deposit = await DatCocDAO.getById(id);
  if (!deposit?.anh_chung_tu_encrypted) return null;
  const { decryptToBase64 } = await import('../utils/encrypt');
  const base64 = decryptToBase64(deposit.anh_chung_tu_encrypted);
  return { base64, mimeType: (deposit as any).mime_type || 'image/jpeg' };
}
