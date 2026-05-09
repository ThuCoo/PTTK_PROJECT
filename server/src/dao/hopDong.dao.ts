import { query } from "../db";
import { HopDong, ThanhVienNhom } from "../types";
import { generateNextCode } from '../utils/generateCode';
export async function getAll(
  search?: string,
  trangThai?: string,
): Promise<HopDong[]> {
  let sql = `
    SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
    FROM hop_dong hd
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (hd.ma_hd ILIKE $${idx} OR k.ho_ten ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND hd.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += " ORDER BY hd.created_at DESC";
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(maHopDong: string | number): Promise<HopDong | null> {
  const result = await query(
    `SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
     FROM hop_dong hd
     LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     WHERE hd.ma_hop_dong = $1`,
    [String(maHopDong)],
  );
  return result.rows[0] || null;
}

export async function create(data: any): Promise<HopDong> {
  const result = await query(
    `INSERT INTO hop_dong
     (ma_hop_dong, ma_khach_hang, ma_phong, so_giuong, ngay_nhan_phong, ngay_lap, ky_thanh_toan, tien_ban_giao, trang_thai)
     VALUES ($1,$2,$3,$4,CURRENT_DATE,CURRENT_DATE,$5,$6,'Chờ ký') RETURNING *`,
    [
      data.ma_hop_dong || data.ma_hd,
      data.ma_khach_hang || data.khach_hang_id,
      data.ma_phong || data.phong_id,
      data.so_giuong,
      data.ky_thanh_toan || 'Hàng tháng',
      data.tien_ban_giao || 0,
    ],
  );
  return result.rows[0];
}

export async function sign(maHopDong: string | number): Promise<void> {
  await query(
    `UPDATE hop_dong SET trang_thai='Đang hiệu lực', ngay_ky=CURRENT_DATE WHERE ma_hop_dong=$1`,
    [String(maHopDong)],
  );
}

export async function terminate(maHopDong: string | number): Promise<void> {
  await query(`UPDATE hop_dong SET trang_thai='Đã kết thúc' WHERE ma_hop_dong=$1`, [String(maHopDong)]);
}

export async function finalize(id: number): Promise<void> {
  await query(`UPDATE hop_dong SET trang_thai='Đã thanh lý' WHERE ma_hop_dong=$1`, [id]);
}

export async function recordCheckoutTime(
  id: number,
  checkoutTime: string,
): Promise<void> {
  await query(`UPDATE hop_dong SET ngay_tra_thuc_te=$1 WHERE ma_hop_dong=$2`, [
    checkoutTime,
    id,
  ]);
}

export async function getByStatus(trangThai: string): Promise<HopDong[]> {
  const result = await query(
    `SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
     FROM hop_dong hd
     LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     WHERE hd.trang_thai = $1
     ORDER BY hd.created_at DESC`,
    [trangThai],
  );
  return result.rows;
}

export async function addGroupMembers(
  hopDongId: number,
  members: ThanhVienNhom[],
): Promise<void> {
  for (const m of members) {
    await query(
      `INSERT INTO thanh_vien_nhom (hop_dong_id, ho_ten, cccd, phone, ngay_sinh, dia_chi_thuong_tru)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [hopDongId, m.ho_ten, m.cccd, m.phone, m.ngay_sinh, m.dia_chi_thuong_tru],
    );
  }
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang hiệu lực') as hieu_luc,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ ký') as cho_ky,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang hiệu lực' AND ngay_ket_thuc <= CURRENT_DATE + 30) as sap_het_han
     FROM hop_dong`,
  );
  const r = result.rows[0];
  return {
    tong: parseInt(r.tong, 10),
    hieu_luc: parseInt(r.hieu_luc, 10),
    cho_ky: parseInt(r.cho_ky, 10),
    sap_het_han: parseInt(r.sap_het_han, 10),
  };
}
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