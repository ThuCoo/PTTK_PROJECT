import { PhieuDangKyDAO } from "../dao/phieuDangKy.dao";

export async function getPendingVerification() {
  return await PhieuDangKyDAO.getPendingVerification();
}

export async function updateVerificationStatus(maPhieuDK: string, trangThai: string) {
  await PhieuDangKyDAO.updateStatus(maPhieuDK, trangThai);
  return { success: true, message: "Cập nhật trạng thái thành công" };
}

export async function rejectAssignedRoom(maPhieuDK: string, ghiChu: string) {
  await PhieuDangKyDAO.rejectRoom(maPhieuDK);
  // Có thể console.log(ghiChu) hoặc lưu vào bảng Log nếu cần
  return { success: true, message: "Đã từ chối phòng/giường thành công" };
}
export async function completeVerification(maPhieuDK: string) {
  const result = await PhieuDangKyDAO.completeVerificationAndCreateDeposit(maPhieuDK);
  return { 
    success: true, 
    message: "Hoàn tất rà soát và đã tạo hóa đơn cọc tự động",
    data: result // Trả về số tiền cọc để hiện lên màn hình thông báo
  };
}