import { query } from '../db';
import { HopDong, ThanhVienNhom } from '../types';
import { generateNextCode } from '../utils/generateCode';
export async function getAllPending() {
  const result = await query(
    `SELECT DISTINCT ON (h.ma_hoa_don)
        h.ma_hoa_don as MaHoaDon, 
        k.ho_ten as Hoten, 
        COALESCE(pdk_p.ma_phong, p_from_g.ma_phong) as MaPhong,
        COALESCE(p_from_p.gia_thue_phong, p_from_g.gia_thue_phong) as GiaThuePhong,
        pdk.hinh_thuc_thue as HinhThucThue
     FROM hoa_don_coc h
     JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk  
     JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     LEFT JOIN phong p_from_p ON pdk_p.ma_phong = p_from_p.ma_phong
     LEFT JOIN phieu_dang_ky_giuong pdk_g ON pdk.ma_phieu_dk = pdk_g.ma_phieu_dk
     LEFT JOIN giuong g ON pdk_g.ma_giuong = g.ma_giuong
     LEFT JOIN phong p_from_g ON g.ma_phong = p_from_g.ma_phong
     WHERE h.trang_thai = 'Đã thanh toán' 
       AND NOT EXISTS (SELECT 1 FROM hop_dong hd WHERE hd.ma_hoa_don = h.ma_hoa_don AND hd.trang_thai <> 'Chờ ký')
     ORDER BY h.ma_hoa_don`
  );
  //       AND pdk.trang_thai = 'Đủ điều kiện'
  return result.rows;
}
export async function updateStatus(maHopDong: string, trangThai: 'Đang hiệu lực' | 'Đã kết thúc') {
  if (trangThai === 'Đang hiệu lực') {
    // Nếu xác nhận HĐ -> Cập nhật trạng thái VÀ gán Ngày nhận phòng = NOW()
    await query(
      `UPDATE hop_dong SET trang_thai = $1, ngay_nhan_phong = NOW() WHERE ma_hop_dong = $2`, 
      [trangThai, maHopDong]
    );
  } else {
    // Nếu hủy HĐ -> Chỉ cập nhật trạng thái, không đụng tới Ngày nhận phòng
    await query(
      `UPDATE hop_dong SET trang_thai = $1 WHERE ma_hop_dong = $2`, 
      [trangThai, maHopDong]
    );
  }
  return { success: true };
}
export async function getDetailsByDepositCode(maHoaDonCoc: string) {
  // --- Query 1: Lấy thông tin chính ---
  const mainInfoResult = await query(
    `SELECT 
        h.ma_hoa_don as MaHoaDon, h.so_tien_coc as SoTienCoc,
        pdk.ma_phieu_dk as MaPhieuDK, pdk.hinh_thuc_thue as HinhThucThue,
        k.ma_khach_hang as MaKhachHang, k.ho_ten as TenKhachHang,
        p.ma_phong as MaPhong, p.khu_vuc as KhuVuc, p.gia_thue_phong as GiaThuePhong
     FROM hoa_don_coc h
     JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk
     JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     LEFT JOIN phong p ON pdk_p.ma_phong = p.ma_phong
     WHERE h.ma_hoa_don = $1`,
    [maHoaDonCoc]
  );
  if (mainInfoResult.rows.length === 0) return null;
  const mainInfo = mainInfoResult.rows[0];

  // --- Query 2: Lấy danh sách thành viên ---
  const membersResult = await query(
    `SELECT kh.ho_ten as HoTen, kh.cccd as CCCD
     FROM phieu_dang_ky_khach_hang pk
     JOIN khach_hang kh ON pk.ma_khach_hang = kh.ma_khach_hang
     WHERE pk.ma_phieu_dk = $1`,
    [mainInfo.MaPhieuDK]
  );
  mainInfo.members = membersResult.rows;

  // --- Query 3: Lấy danh sách dịch vụ đi kèm ---
  // Giả sử bạn có bảng HopDong_DichVu hoặc Phong_DichVu, ở đây dùng tạm logic mẫu
  const servicesResult = await query(
    `SELECT dv.ten_dich_vu as TenDichVu, dv.don_gia as DonGia
     FROM dich_vu dv
     JOIN dich_vu_chi_nhanh dvc ON dv.ma_dich_vu = dvc.ma_dich_vu
     JOIN phong p ON dvc.ma_chi_nhanh = p.ma_chi_nhanh
     WHERE p.ma_phong = $1`,
    [mainInfo.MaPhong]
  );
  mainInfo.services = servicesResult.rows;
  
  // --- Query 4: Lấy danh sách giường đã gán ---
  const bedsResult = await query(
    `SELECT g.ma_giuong as MaGiuong, g.gia_thue_giuong as GiaThueGiuong
     FROM phieu_dang_ky_giuong pg
     JOIN giuong g ON pg.ma_giuong = g.ma_giuong
     WHERE pg.ma_phieu_dk = $1`,
    [mainInfo.MaPhieuDK]
  );
  mainInfo.beds = bedsResult.rows;

  return mainInfo;
}
// Thêm hàm này vào file src/dao/hopDong.dao.ts

export async function getOrCreate(maHoaDonCoc: string) {
  // 1. Kiểm tra xem hợp đồng đã tồn tại chưa
  const existResult = await query(
    `SELECT ma_hop_dong as ma_hop_dong, ma_hoa_don as ma_hoa_don, trang_thai as trang_thai FROM hop_dong WHERE ma_hoa_don = $1`, 
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
  const maHopDong = await generateNextCode('hd', 'hop_dong', 'ma_hop_dong');
  
  // Lấy thông tin khách từ phiếu đăng ký để gán
  const customerResult = await query(`
      SELECT pdk.ma_khach_hang as ma_khach_hang FROM hoa_don_coc h 
      JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk 
      WHERE h.ma_hoa_don = $1`, [maHoaDonCoc]);
      
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
    `INSERT INTO hop_dong (ma_hop_dong, ngay_lap, trang_thai, ma_hoa_don, ma_khach_hang) 
     VALUES ($1, $2, $3, $4, $5)`,
    [newContract.MaHopDong, newContract.NgayLap, newContract.TrangThai, newContract.MaHoaDon, newContract.MaKhachHang]
  );
  return newContract;
}