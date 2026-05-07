import * as HopDongDAO from '../dao/hopDong.dao';
import * as PhongDAO from '../dao/phong.dao';
import * as DatCocDAO from '../dao/datCoc.dao';
import { generateNextCode } from '../utils/generateCode';
import { ThanhVienNhom } from '../types';
import { query } from '../db';
export async function getAllPendingContracts() {
  const records = await HopDongDAO.getAllPending();
  // Map lại để UI dùng
  return records.map((r: any) => ({
    // contractId:r.,
    id: r.mahoadon,
    depositCode: r.mahoadon,
    customerName: r.hoten,
    room: r.maphong,
    monthlyRent: parseFloat(r.giathuephong)
  }));
}


// Cập nhật trạng thái
export async function updateStatus(maHopDong: string, trangThai: 'Đang hiệu lực' | 'Đã kết thúc') {
  await query(
    `UPDATE HopDong SET TrangThai = $1, NgayNhanPhong = CASE WHEN $1 = 'Đang hiệu lực' THEN NOW() ELSE NgayNhanPhong END WHERE MaHopDong = $2`, 
    [trangThai, maHopDong]
  );
  return { success: true };
}

export async function getOrCreateContractDetails(maHoaDonCoc: string) {
  // 1. Kiểm tra/Tạo hợp đồng trong DB
  const contract = await HopDongDAO.getOrCreate(maHoaDonCoc);
  
  // 2. Lấy toàn bộ dữ liệu liên quan từ DAO
  const details = await HopDongDAO.getDetailsByDepositCode(maHoaDonCoc);
  if (!details) throw new Error("Không tìm thấy thông tin chi tiết của hồ sơ này.");

  // 3. TÍNH TOÁN TIỀN THUÊ CƠ BẢN (monthlyRent)
  let monthlyRent = 0;
  if (details.hinhthucthue === 'Thuê nguyên phòng') {
    monthlyRent = parseFloat(details.giathuephong);
  } else { // 'Ở ghép'
    // Cộng dồn tiền của từng giường đã chọn
    monthlyRent = details.beds.reduce((total: number, bed: any) => total + parseFloat(bed.giathuegiuong), 0);
  }
  
  // 4. TÍNH TOÁN TIỀN DỊCH VỤ
  const serviceFee = details.services.reduce((total: number, service: any) => total + parseFloat(service.dongia), 0);
  const estimatedUtilityFee = 200000; // Tiền điện nước ước tính, có thể lấy từ config
  
  // 5. MAP VÀ TRẢ VỀ CHO UI
  return {
    // Thông tin từ hợp đồng
    contractId: contract.MaHopDong,
    contractStatus: contract.TrangThai,
    startDate: new Date().toLocaleDateString('vi-VN'),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('vi-VN'),
    
    // Thông tin từ phiếu cọc
    depositCode: details.mahoadon,
    customerName: details.tenkhachhang,
    room: details.maphong,
    area: details.khuvuc,
    numBeds: details.beds.length,
    
    // Danh sách thành viên
    members: details.members.map((m: any) => ({
      fullName: m.hoten,
      idCard: m.cccd
    })),
    
    // Chi phí đã tính toán
    monthlyRent: monthlyRent,
    serviceFee: serviceFee,
    estimatedUtilityFee: estimatedUtilityFee,
    totalFirstPeriod: monthlyRent + serviceFee + estimatedUtilityFee,
  };
}
export async function confirmContract(maHopDong: string) {
  return await HopDongDAO.updateStatus(maHopDong, 'Đang hiệu lực');
}

export async function cancelContract(maHopDong: string) {
  return await HopDongDAO.updateStatus(maHopDong, 'Đã kết thúc');
}