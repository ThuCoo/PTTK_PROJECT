import * as HoaDonCocDAO from "../dao/hoaDonCoc.dao";
import { generateNextCode } from "../utils/generateCode";
import { encryptBuffer } from "../utils/encrypt";
import { query } from "../db";

async function syncOverdueDeposits() {
  const expired = await HoaDonCocDAO.markOverdue();
  // For each expired, we should free up the room
  for (const item of expired) {
    // Find MaPhong from HoaDonCoc -> PhieuDangKy -> PhieuDangKy_Phong
    const result = await query(`
      SELECT pkp.ma_phong 
      FROM hoa_don_coc h
      JOIN phieu_dang_ky_phong pkp ON h.ma_phieu_dk = pkp.ma_phieu_dk
      WHERE h.ma_hoa_don = $1
    `, [item.id]);
    
    if (result.rows[0]) {
      await query(`UPDATE phong SET trang_thai='Trống' WHERE ma_phong=$1`, [result.rows[0].ma_phong]);
    }
  }
}

export async function getAll(search?: string, trangThai?: string) {
  await syncOverdueDeposits();
  return HoaDonCocDAO.getAll(search, trangThai);
}

export async function getById(id: string) {
  await syncOverdueDeposits();
  const d = await HoaDonCocDAO.getById(id);
  if (!d) throw new Error("Không tìm thấy phiếu đặt cọc");
  return d;
}

export async function create(maPhieuDK: string, soTien: number) {
  // Validate PhieuDangKy exists
  const pdkRes = await query(`SELECT * FROM phieu_dang_ky WHERE ma_phieu_dk=$1`, [maPhieuDK]);
  if (!pdkRes.rows[0]) throw new Error("Phiếu đăng ký không tồn tại");
  
  const maHoaDon = await generateNextCode("HD", "hoa_don_coc", "ma_hoa_don");
  
  const deposit = await HoaDonCocDAO.create({
    ma_hoa_don: maHoaDon,
    ma_phieu_dk: maPhieuDK,
    so_tien: soTien,
  });

  // Temporarily hold the room status
  const roomRes = await query(`SELECT ma_phong FROM phieu_dang_ky_phong WHERE ma_phieu_dk=$1`, [maPhieuDK]);
  if (roomRes.rows[0]) {
      await query(`UPDATE phong SET trang_thai='Đã cọc' WHERE ma_phong=$1`, [roomRes.rows[0].ma_phong]);
  }
  
  // Update PhieuDangKy status
  await query(`UPDATE phieu_dang_ky SET trang_thai='Đã tạo cọc' WHERE ma_phieu_dk=$1`, [maPhieuDK]);

  return deposit;
}

export async function uploadProof(
  id: string,
  fileBuffer: Buffer,
  mimeType: string,
  phuongThuc: string,
) {
  await syncOverdueDeposits();
  const deposit = await HoaDonCocDAO.getById(id);
  if (!deposit) throw new Error("Không tìm thấy phiếu đặt cọc");
  if (
    [
      "Đã xác nhận",
      "Hoàn tiền",
      "Quá hạn thanh toán",
      "Đã hủy (quá hạn)",
    ].includes(deposit.trang_thai)
  ) {
    throw new Error("Phiếu đặt cọc đã kết thúc");
  }
  console.log("Deposit details:", deposit);
  if (
    deposit.trang_thai !== "Chờ thanh toán" &&
    deposit.trang_thai !== "Không hợp lệ" && 
    deposit.trang_thai !== "Đang xử lý"
  ) {
    throw new Error("Phiếu đặt cọc chưa ở trạng thái có thể gửi chứng từ");
  }

  const encrypted = encryptBuffer(fileBuffer);
  console.log("Encrypted proof image for deposit", { id, encryptedLength: encrypted.length, mimeType, phuongThuc });
  await HoaDonCocDAO.uploadProof(id, encrypted, mimeType, phuongThuc);
}

export async function confirm(id: string, nguoiXacNhan: string) {

  const deposit = await HoaDonCocDAO.getById(id);
  if (!deposit) throw new Error("Không tìm thấy phiếu đặt cọc");
  if (
    deposit.trang_thai !== "Đang xử lý" &&
    deposit.trang_thai !== "Chờ xác nhận"
  ) {
    throw new Error('Chỉ có thể xác nhận phiếu ở trạng thái "Đang xử lý"');
  }
  const validKeToanId = "NV03"; 
  await HoaDonCocDAO.confirm(id, validKeToanId);
  
  // Fix Use Case Logic: Update room status properly upon confirmation
  if (deposit.ma_phong) {
     // If bed tracking was implemented here, we would update DangO.
     // For now, confirm room status is "Đã cọc" (or maybe "Đã thuê" depending on logic)
     await query(`UPDATE phong SET trang_thai='Đã cọc' WHERE ma_phong=$1`, [deposit.ma_phong]);
  }
}

export async function reject(id: string, ghiChu: string) {
  const deposit = await HoaDonCocDAO.getById(id);
  if (!deposit) throw new Error("Không tìm thấy phiếu đặt cọc");
  if (
    !["Đang xử lý", "Chờ xác nhận", "Không hợp lệ"].includes(deposit.trang_thai)
  ) {
    throw new Error("Phiếu đặt cọc không ở trạng thái cần kiểm tra");
  }
  await HoaDonCocDAO.reject(id, ghiChu);
}

export async function refund(id: string, ghiChu: string) {
  const deposit = await HoaDonCocDAO.getById(id);
  if (!deposit) throw new Error("Không tìm thấy phiếu đặt cọc");
  if (
    [
      "Đã xác nhận",
      "Hoàn tiền",
      "Quá hạn thanh toán",
      "Đã hủy (quá hạn)",
    ].includes(deposit.trang_thai)
  ) {
    throw new Error("Phiếu đặt cọc đã kết thúc");
  }

  await HoaDonCocDAO.refund(id, ghiChu);
  if (deposit.ma_phong) {
    await query(`UPDATE phong SET trang_thai='Trống' WHERE ma_phong=$1`, [deposit.ma_phong]);
  }
  // Revert customer status if needed
}

export async function getStats() {
  await syncOverdueDeposits();
  return HoaDonCocDAO.getStats();
}

/** Returns decrypted image as base64 string */
export async function getProofImage(
  id: string,
): Promise<{ base64: string; mimeType: string } | null> {
  const deposit = await HoaDonCocDAO.getById(id);
  if (!deposit?.anh_chung_tu_encrypted) return null;
  const { decryptToBase64 } = await import("../utils/encrypt");
  const base64 = decryptToBase64(deposit.anh_chung_tu_encrypted);
  return { base64, mimeType: deposit.mime_type || "image/jpeg" };
}

export async function getAllPhieuDangKy() {
  var data= await HoaDonCocDAO.getAllPhieuDangKy();
  console.log("Fetched PhieuDangKy for deposit creation:", data);
  return data;
}
