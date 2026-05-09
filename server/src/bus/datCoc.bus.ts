import * as DatCocDAO from "../dao/datCoc.dao";
import * as PhongDAO from "../dao/phong.dao";
import * as KhachHangDAO from "../dao/khachHang.dao";
import { generateNextCode } from "../utils/generateCode";
import { encryptBuffer } from "../utils/encrypt";

async function syncOverdueDeposits() {
  const expired = await DatCocDAO.markOverdue();
  for (const item of expired) {
    await PhongDAO.updateStatus(item.ma_phong, "Trống");
  }
}

export async function getAll(search?: string, trangThai?: string) {
  await syncOverdueDeposits();
  return DatCocDAO.getAll(search, trangThai);
}

export async function getById(maCoc: string) {
  await syncOverdueDeposits();
  const d = await DatCocDAO.getById(maCoc);
  if (!d) throw new Error("Không tìm thấy phiếiu đặt cọc");
  return d;
}

export async function searchByCodeOrPhone(query: string) {
  await syncOverdueDeposits();
  const d = await DatCocDAO.getByMaCoc(query);
  if (!d) throw new Error("Không tìm thấy dữ liệu đặt cọc phù hợp");
  return d;
}

export async function create(
  khachHangId: number,
  phongId: number,
  soGiuong: number,
) {
  const phong = await PhongDAO.getById(phongId);
  if (!phong) throw new Error("Phòng không tồn tại");
  if (soGiuong <= 0) throw new Error("Số giường phải lớn hơn 0");
  if (soGiuong > phong.suc_chua - phong.dang_o) {
    throw new Error(
      `Phòng chỉ còn ${phong.suc_chua - phong.dang_o} giường trống`,
    );
  }

  // Business rule: deposit = 2 months × beds × price per bed
  const soTien = 2 * soGiuong * phong.gia_thue;
  const hanThanhToan = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours

  const maCoc = await generateNextCode("DC", "dat_coc", "ma_coc");
  const deposit = await DatCocDAO.create({
    ma_coc: maCoc,
    khach_hang_id: khachHangId,
    phong_id: phongId,
    so_giuong: soGiuong,
    so_tien: soTien,
    han_thanh_toan: hanThanhToan,
  });

  // Update room status to "Đã cọc"
  await PhongDAO.updateStatus(phongId, "Đã cọc");
  await KhachHangDAO.updateStatus(khachHangId, "Đồng ý thuê");

  return deposit;
}

export async function uploadProof(
  maCoc: string,
  fileBuffer: Buffer,
  mimeType: string,
  phuongThuc: string,
) {
  await syncOverdueDeposits();
  const deposit = await DatCocDAO.getById(maCoc);
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
  if (
    deposit.trang_thai !== "Chờ thanh toán" &&
    deposit.trang_thai !== "Không hợp lệ"
  ) {
    throw new Error("Phiếu đặt cọc chưa ở trạng thái có thể gửi chứng từ");
  }

  const encrypted = encryptBuffer(fileBuffer);
  await DatCocDAO.uploadProof(maCoc, encrypted, mimeType, phuongThuc);
}
export async function confirm(maCoc: string, nguoiXacNhan: string) {
  const deposit = await DatCocDAO.getById(maCoc);
  if (!deposit) throw new Error("Không tìm thấy phiếu đặt cọc");
  if (
    deposit.trang_thai !== "Đang xử lý" &&
    deposit.trang_thai !== "Chờ xác nhận"
  ) {
    throw new Error('Chỉ có thể xác nhận phiếu ở trạng thái "Đang xử lý"');
  }
  await DatCocDAO.confirm(maCoc, nguoiXacNhan);
}

export async function reject(maCoc: string, ghiChu: string) {
  const deposit = await DatCocDAO.getById(maCoc);
  if (!deposit) throw new Error("Không tìm thấy phiếu đặt cọc");
  if (
    !["Đang xử lý", "Chờ xác nhận", "Không hợp lệ"].includes(deposit.trang_thai)
  ) {
    throw new Error("Phiếu đặt cọc không ở trạng thái cần kiểm tra");
  }
  await DatCocDAO.reject(maCoc, ghiChu);
}

export async function refund(maCoc: string, ghiChu: string) {
  const deposit = await DatCocDAO.getById(maCoc);
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

  await DatCocDAO.refund(maCoc, ghiChu);
  await PhongDAO.updateStatus(deposit.ma_phong, "Trống");
  await KhachHangDAO.updateStatus(deposit.ma_khach_hang, "Đang tư vấn");
}

export async function getStats() {
  await syncOverdueDeposits();
  return DatCocDAO.getStats();
}

/** Returns decrypted image as base64 string */
export async function getProofImage(
  maCoc: string,
): Promise<{ base64: string; mimeType: string } | null> {
  const deposit = await DatCocDAO.getById(maCoc);
  if (!deposit?.anh_chung_tu_encrypted) return null;
  const { decryptToBase64 } = await import("../utils/encrypt");
  const base64 = decryptToBase64(deposit.anh_chung_tu_encrypted);
  return { base64, mimeType: (deposit as any).mime_type || "image/jpeg" };
}
export async function getDepositInfoByPhone(phone: string) {
  const data = await DatCocDAO.getByPhone(phone);
  if (!data) return null;

  return {
    depositCode: data.ma_hoa_don,
    customerName: data.ten_khach,
    room: data.ma_phong || 'Chưa gán',
    area: data.khu_vuc || 'N/A',
    numBeds: data.so_nguoi_du_kien || 0,
    depositAmount: parseFloat(data.so_tien_coc),
    status: data.trang_thai,
    depositDate: new Date(data.ngay_lap).toLocaleDateString('vi-VN'),
    
    // 👉 ĐƯA MẢNG MEMBERS LÊN FRONTEND
    members: data.members.map((m: any, index: number) => {
      // Chuyển ngày sinh từ DB sang YYYY-MM-DD cho input type="date"
      let formattedDate = '';
      if (m.ngaysinh) {
        const d = new Date(m.ngaysinh);
        formattedDate = d.toISOString().split('T')[0]; // Cắt lấy phần YYYY-MM-DD
      }

      return {
        id: index + 1, // ID tăng dần 1, 2, 3... để UI dùng làm key
        fullName: m.hoten || '',
        idCard: m.cccd || '',
        phone: m.sdt || '',
        dateOfBirth: formattedDate,
        permanentAddress: m.diachi || '',
        errors: {}
      };
    })
  };
}
export async function saveGroupMembers(maHD: string, members: any[]) {
  if (!maHD) throw new Error("Mã hóa đơn không hợp lệ");
  if (!members || members.length === 0) throw new Error("Vui lòng thêm ít nhất 1 thành viên");

  // Validate đảm bảo có CCCD (bắt buộc để tra cứu trùng lặp)
  for (const m of members) {
    if (!m.idCard || m.idCard.trim() === '') {
      throw new Error(`Vui lòng nhập đầy đủ CCCD cho tất cả thành viên để quản lý.`);
    }
  }

  await DatCocDAO.saveGroupMembers(maHD, members);
  return { success: true };
}