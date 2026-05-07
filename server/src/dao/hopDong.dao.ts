import { query } from '../db';
import { HopDong, ThanhVienNhom } from '../types';
import { generateNextCode } from '../utils/generateCode';
export async function getAllPending() {
  const result = await query(
    `SELECT DISTINCT ON (h.MaHoaDon)
        h.MaHoaDon, 
        k.HoTen, 
        COALESCE(pdk_p.MaPhong, p_from_g.MaPhong) as MaPhong,
        COALESCE(p_from_p.GiaThuePhong, p_from_g.GiaThuePhong) as GiaThuePhong,
        pdk.HinhThucThue
     FROM HoaDonCoc h
     JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK  
     JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     LEFT JOIN Phong p_from_p ON pdk_p.MaPhong = p_from_p.MaPhong
     LEFT JOIN PhieuDangKy_Giuong pdk_g ON pdk.MaPhieuDK = pdk_g.MaPhieuDK
     LEFT JOIN Giuong g ON pdk_g.MaGiuong = g.MaGiuong
     LEFT JOIN Phong p_from_g ON g.MaPhong = p_from_g.MaPhong
     WHERE h.TrangThai = 'Đã thanh toán' 
       AND pdk.TrangThai = 'Đủ điều kiện'
       AND NOT EXISTS (SELECT 1 FROM HopDong hd WHERE hd.MaHoaDon = h.MaHoaDon AND hd.trangthai <> 'Chờ ký')
     ORDER BY h.MaHoaDon`
  );
  return result.rows;
}
export async function updateStatus(maHopDong: string, trangThai: 'Đang hiệu lực' | 'Đã kết thúc') {
  if (trangThai === 'Đang hiệu lực') {
    // Nếu xác nhận HĐ -> Cập nhật trạng thái VÀ gán Ngày nhận phòng = NOW()
    await query(
      `UPDATE HopDong SET TrangThai = $1, NgayNhanPhong = NOW() WHERE MaHopDong = $2`, 
      [trangThai, maHopDong]
    );
  } else {
    // Nếu hủy HĐ -> Chỉ cập nhật trạng thái, không đụng tới Ngày nhận phòng
    await query(
      `UPDATE HopDong SET TrangThai = $1 WHERE MaHopDong = $2`, 
      [trangThai, maHopDong]
    );
  }
  return { success: true };
}
export async function getDetailsByDepositCode(maHoaDonCoc: string) {
  // --- Query 1: Lấy thông tin chính ---
  const mainInfoResult = await query(
    `SELECT 
        h.MaHoaDon, h.SoTienCoc,
        pdk.MaPhieuDK, pdk.HinhThucThue,
        k.MaKhachHang, k.HoTen AS TenKhachHang,
        p.MaPhong, p.KhuVuc, p.GiaThuePhong
     FROM HoaDonCoc h
     JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK
     JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
     LEFT JOIN PhieuDangKy_Phong pdk_p ON pdk.MaPhieuDK = pdk_p.MaPhieuDK
     LEFT JOIN Phong p ON pdk_p.MaPhong = p.MaPhong
     WHERE h.MaHoaDon = $1`,
    [maHoaDonCoc]
  );
  if (mainInfoResult.rows.length === 0) return null;
  const mainInfo = mainInfoResult.rows[0];

  // --- Query 2: Lấy danh sách thành viên ---
  const membersResult = await query(
    `SELECT kh.HoTen, kh.CCCD
     FROM PhieuDangKy_KhachHang pk
     JOIN KhachHang kh ON pk.MaKhachHang = kh.MaKhachHang
     WHERE pk.MaPhieuDK = $1`,
    [mainInfo.maphieudk]
  );
  mainInfo.members = membersResult.rows;

  // --- Query 3: Lấy danh sách dịch vụ đi kèm ---
  // Giả sử bạn có bảng HopDong_DichVu hoặc Phong_DichVu, ở đây dùng tạm logic mẫu
  const servicesResult = await query(
    `SELECT dv.TenDichVu, dv.DonGia
     FROM DichVu dv
     JOIN DichVu_ChiNhanh dvc ON dv.MaDichVu = dvc.MaDichVu
     JOIN Phong p ON dvc.MaChiNhanh = p.MaChiNhanh
     WHERE p.MaPhong = $1`,
    [mainInfo.maphong]
  );
  mainInfo.services = servicesResult.rows;
  
  // --- Query 4: Lấy danh sách giường đã gán ---
  const bedsResult = await query(
    `SELECT g.MaGiuong, g.GiaThueGiuong
     FROM PhieuDangKy_Giuong pg
     JOIN Giuong g ON pg.MaGiuong = g.MaGiuong
     WHERE pg.MaPhieuDK = $1`,
    [mainInfo.maphieudk]
  );
  mainInfo.beds = bedsResult.rows;

  return mainInfo;
}
// Thêm hàm này vào file src/dao/hopDong.dao.ts

export async function getOrCreate(maHoaDonCoc: string) {
  // 1. Kiểm tra xem hợp đồng đã tồn tại chưa
  const existResult = await query(
    `SELECT MaHopDong as ma_hop_dong, MaHoaDon as ma_hoa_don, TrangThai as trang_thai FROM HopDong WHERE MaHoaDon = $1`, 
    [maHoaDonCoc]
  );
  if (existResult.rows.length > 0) {
    return {
      MaHopDong: existResult.rows[0].ma_hop_dong,
      MaHoaDon: existResult.rows[0].ma_hoa_don,
      TrangThai: existResult.rows[0].trang_thai
    };
  }

  // 2. Nếu chưa, tạo mới hợp đồng
  const maHopDong = await generateNextCode('hd', 'hopdong', 'mahopdog');
  
  // Lấy thông tin khách từ phiếu đăng ký để gán
  const customerResult = await query(`
      SELECT pdk.MaKhachHang as ma_khach_hang FROM HoaDonCoc h 
      JOIN PhieuDangKy pdk ON h.MaPhieuDK = pdk.MaPhieuDK 
      WHERE h.MaHoaDon = $1`, [maHoaDonCoc]);
      
  if (customerResult.rows.length === 0) throw new Error("Không thể tìm thấy khách hàng tương ứng với hóa đơn cọc");

  const maKhachHang = customerResult.rows[0].ma_khach_hang;

  const newContract = {
    MaHopDong: maHopDong,
    NgayLap: new Date(),
    TrangThai: 'Chờ ký',
    MaHoaDon: maHoaDonCoc,
    MaKhachHang: maKhachHang,
  };

  await query(
    `INSERT INTO HopDong (MaHopDong, NgayLap, TrangThai, MaHoaDon, MaKhachHang) 
     VALUES ($1, $2, $3, $4, $5)`,
    [newContract.MaHopDong, newContract.NgayLap, newContract.TrangThai, newContract.MaHoaDon, newContract.MaKhachHang]
  );
  return newContract;
}