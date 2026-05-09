import * as HopDongDAO from "../dao/hopDong.dao";
import * as PhongDAO from "../dao/phong.dao";
import * as KhachHangDAO from "../dao/khachHang.dao";
import * as DatCocDAO from "../dao/datCoc.dao";
import { generateNextCode } from "../utils/generateCode";
import { ThanhVienNhom } from "../types";
import { query } from '../db';
export async function getAll(search?: string, trangThai?: string) {
  return HopDongDAO.getAll(search, trangThai);
}

export async function getById(id: string | number) {
  const maHopDong = String(id);
  const hd = await HopDongDAO.getById(maHopDong);
  if (!hd) throw new Error("Không tìm thấy hợp đồng");
  return hd;
}

export async function create(data: {
  khach_hang_id: string | number;
  phong_id: string | number;
  so_giuong: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
}) {
  if (!data.ngay_bat_dau || !data.ngay_ket_thuc)
    throw new Error("Ngày bắt đầu và kết thúc là bắt buộc");
  if (new Date(data.ngay_bat_dau) >= new Date(data.ngay_ket_thuc)) {
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
  }

  const maPhong = String(data.phong_id);
  const maKhachHang = String(data.khach_hang_id);
  const phong = await PhongDAO.getById(maPhong);
  if (!phong) throw new Error("Phòng không tồn tại");

  // Ensure deposit is confirmed
  const deposits = await DatCocDAO.getAll(undefined, "Đã xác nhận");
  const hasDeposit = deposits.some(
    (d) =>
      d.ma_phong === maPhong && d.ma_khach_hang === maKhachHang,
  );
  if (!hasDeposit)
    throw new Error(
      "Chưa có đặt cọc được xác nhận cho khách hàng và phòng này",
    );

  const giaThue = phong.gia_thue_phong || phong.gia_thue || 0;
  const tongTien = giaThue * data.so_giuong;
  const tienCoc = tongTien * 2; // 2 months deposit

  const maHd = await generateNextCode("HD", "hop_dong", "ma_hop_dong");
  return HopDongDAO.create({
    ma_hop_dong: maHd,
    ma_khach_hang: maKhachHang,
    ma_phong: maPhong,
    so_giuong: data.so_giuong,
    ngay_bat_dau: data.ngay_bat_dau,
    ngay_ket_thuc: data.ngay_ket_thuc,
    gia_thue_moi_giuong: giaThue,
    tong_tien_thue: tongTien,
    tien_coc: tienCoc,
  });
}

export async function sign(id: string | number) {
  const maHopDong = String(id);
  const hd = await HopDongDAO.getById(maHopDong);
  if (!hd) throw new Error("Không tìm thấy hợp đồng");
  if (hd.trang_thai !== "Chờ ký")
    throw new Error("Hợp đồng không ở trạng thái chờ ký");

  await HopDongDAO.sign(id);
  await PhongDAO.incrementOccupied(hd.phong_id, hd.so_giuong);
  const newOccupied = (await PhongDAO.getById(hd.phong_id))!.dang_o;
  const phong = (await PhongDAO.getById(hd.phong_id))!;
  const newStatus =
    newOccupied >= phong.suc_chua ? "Đang sử dụng" : "Còn giường";
  await PhongDAO.updateStatus(hd.phong_id, newStatus);
}

export async function terminate(id: number) {
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error("Không tìm thấy hợp đồng");
  await HopDongDAO.terminate(id);
  await PhongDAO.incrementOccupied(hd.phong_id, -hd.so_giuong);
  const phong = await PhongDAO.getById(hd.phong_id);
  if (phong && phong.dang_o === 0)
    await PhongDAO.updateStatus(hd.phong_id, "Trống");
}

export async function addGroupMembers(
  hopDongId: number,
  members: ThanhVienNhom[],
) {
  if (!members.length) throw new Error("Phải có ít nhất 1 thành viên");
  const hd = await HopDongDAO.getById(hopDongId);
  if (!hd) throw new Error("Không tìm thấy hợp đồng");
  if (members.length > hd.so_giuong) {
    throw new Error(
      `Số thành viên (${members.length}) vượt quá số giường đã cọc (${hd.so_giuong})`,
    );
  }
  // Check required fields
  for (const m of members) {
    if (!m.ho_ten?.trim()) throw new Error("Họ tên thành viên là bắt buộc");
    if (!m.cccd?.trim()) throw new Error("CCCD thành viên là bắt buộc");
  }
  await HopDongDAO.addGroupMembers(hopDongId, members);
}

export async function roomReturn(id: string, roomReportNotes: string) {
  // Step 1: Verify contract exists
  console.log("Starting room return process for contract ID:", id);
  const hd = await HopDongDAO.getById(id);
  if (!hd) throw new Error("Không tìm thấy hợp đồng");

  // Step 2: Verify contract is currently active (Đang hiệu lực)
  // console.log('hd ', hd)
  // if (hd.trang_thai !== "Đang hiệu lực") {
  //   throw new Error("Hợp đồng không ở trạng thái có thể trả phòng");
  // }

  // Step 3: Check if all payments are completed (A1 - payment not completed)
  // For now, we'll use a simple check - in production, this would verify all invoices are paid
  // This is where we would verify: không có phiếu thanh toán nào chưa thanh toán
  // const unpaidPayments = await ThanhToanDAO.getAll(undefined, 'Chưa thanh toán');
  // const hasUnpaidPayments = unpaidPayments.some(p => p.hop_dong_id === id);
  // if (hasUnpaidPayments) {
  //   throw new Error('Chưa hoàn tất thanh toán');
  // }

  // Step 4: Verify room report exists (A2 - no room report)
  // if (!roomReportNotes || !roomReportNotes.trim()) {
  //   throw new Error("Chưa có biên bản trả phòng");
  // }

  // Step 5: Update contract status to "Đã thanh lý"
  await HopDongDAO.finalize(id);

  // Step 6: Update room/bed status to "Trống" and record checkout time
  
  await PhongDAO.releaseResources(hd.ma_hop_dong);
  // Step 7: Record checkout time
  const checkoutTime = new Date().toISOString();
  // await HopDongDAO.recordCheckoutTime(id, checkoutTime);

  return {
    success: true,
    message: "Hoàn trả phòng thành công",
    checkoutTime: checkoutTime,
    contractId: id,
  };
}

export async function getReturnReady() {
  console.log("Fetching contracts ready for return...");
  return HopDongDAO.getByStatus("Đang hiệu lực");
}

export async function getStats() {
  return HopDongDAO.getStats();
}
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